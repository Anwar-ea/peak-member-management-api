import { inject, injectable } from "tsyringe";
import { IReportingService } from "./abstractions/reporting-service";
import { IAccountRepository, IUserRepository } from "../dal";
import { CustomMeasurableValue, Measurable, Retention, Revenue, User } from "../entities";
import { Types } from "mongoose";
import moment from "moment";
import { weekProducer } from "../utility";
import { ICustomMeasurableValueResponse, IMeasurableResponse, IReportTotals, ITokenUser } from "../models";
import { IMeasurableReport } from "../models/inerfaces/reports";
import { CustomGoalType, GoalUnits } from "../models/enums/goals.enum";
import { reportTotalsQuery } from "../constants/queries";

@injectable()
export class ReportingService implements IReportingService {
    constructor(@inject('UserRepository') private readonly userRepository: IUserRepository, @inject('AccountRepository') private readonly accountRepository: IAccountRepository) { }

    async get(contextUser: ITokenUser, userId?: string): Promise<Array<IMeasurableReport>> {
        let matchQuery: Record<string, any> = {
            'active': true, 
            'deleted': false, 
            'accountId': new Types.ObjectId(contextUser.accountId)
        };

        if (userId) {
            matchQuery['_id'] = new Types.ObjectId(userId);
        }
        
        let measurableTypes: Array<GoalUnits> = [];
        if(contextUser.privileges.includes('lawFirmRelativeDataDashboard')) {
          matchQuery['lawFirmId'] = new Types.ObjectId(contextUser?.lawFirmId);
        }

        if(contextUser.privileges.includes('seeRevenueScoreCard')) measurableTypes.push(GoalUnits.Revenue);
        if(contextUser.privileges.includes('seeRetentionScoreCard')) measurableTypes.push(GoalUnits.RetentionRate);

        let result = await this.userRepository.aggregate<User & { measurables: Array<Measurable & {customValues: Array<CustomMeasurableValue>}>, revenues: Array<Revenue>, retentions: Array<Retention> }>(
            [
                {
                  '$match': matchQuery
                }, 
                {
                  '$lookup': 
                  {
                    'from': 'Measurable', 
                    'let': {
                      'accountableId': '$_id'
                    }, 
                    'pipeline': [
                      {
                        '$match': {
                          '$expr': {
                            '$and': [
                              {
                                '$eq': [
                                  '$accountableId', '$$accountableId'
                                ]
                              }, 
                              {
                                '$eq': [
                                  '$active', true
                                ]
                              }, 
                              {
                                '$eq': [
                                  '$deleted', false
                                ]
                              },
                              {  
                                '$in': ["$unit", measurableTypes]
                              }
                            ]
                          }
                        },
                      },
                      {
                        '$lookup' :  {
                          from: "CustomMeasurableValue",
                          let: {
                            measureableId: "$_id"
                          },
                          pipeline: [
                            {
                              $match: {
                                $expr: {
                                  $and: [
                                    {
                                      $eq: ["$$measureableId", "$measurableId"]
                                    },
                                    {
                                      $eq: ["$active", true]
                                    },
                                    {
                                      $eq: ["$deleted", false]
                                    },
                                    {
                                      $eq: ["$year", 2025]
                                    }
                                  ]
                                }
                              }
                            },
                            {
                              $sort: {
                                week: -1
                              }
                            }
                          ],
                          as: "customValues"
                        }
                      }
                    ], 
                    'as': 'measurables'
                  }
                }, 
                {
                  '$lookup': {
                    'from': 'Revenue', 
                    'let': {
                      'userId': '$_id'
                    }, 
                    'pipeline': [
                      {
                        '$match': {
                          '$expr': {
                            '$and': [
                              {
                                '$eq': [
                                  '$userId', '$$userId'
                                ]
                              }, 
                              {
                                '$eq': [
                                  '$active', true
                                ]
                              }, 
                              {
                                '$eq': [
                                  '$deleted', false
                                ]
                              }, 
                              {
                                '$eq': [
                                  '$year', moment().get('year')
                                ]
                              },
                             
                            ]
                          }
                        }
                      }, {
                        '$sort': {
                          'week': -1
                        }
                      }
                    ], 
                    'as': 'revenues'
                  }
                },
                {
                  $lookup: {
                    from: "Retention",
                    let: {
                      userId: "$_id"
                    },
                    pipeline: [
                      {
                        $match: {
                          $expr: {
                            $and: [
                              {
                                $eq: ["$userId", "$$userId"]
                              },
                              {
                                $eq: ["$active", true]
                              },
                              {
                                $eq: ["$deleted", false]
                              },
                              {
                                $eq: ["$year", moment().get('year')]
                              }
                            ],
                          }
                        }
                      },
                      {
                        $sort: {
                          week: -1
                        }
                      }
                    ],
                    as: "retentions"
                  }
                },
                {
                  '$match': {
                    'measurables': {
                      '$gt': {
                        '$size': 0
                      }
                    }
                  }
                }
              ]
        );

        let weeks = weekProducer();

        for (let week of weeks) {
            for (let res of result) {
                if (!res.revenues.some(x => x.week === week.week)) {
                    res.revenues.push(new Revenue().toEntity({
                        week: week.week,
                        year: week.year,
                        endOfWeek: week.endDate,
                        startOfWeek: week.startDate,
                        revenue: 0,
                        userId: res._id.toString()
                    }, undefined, contextUser));

                    res.revenues = res.revenues.sort((x, y) => y.week - x.week);
                }
                if (!res.retentions.some(x => x.week === week.week)) {
                    res.retentions.push(new Retention().toEntity({
                        week: week.week,
                        year: week.year,
                        endOfWeek: week.endDate,
                        startOfWeek: week.startDate,
                        appointments: 0,
                        retained: 0,
                        userId: res._id.toString()
                    }, undefined, contextUser));

                    res.retentions = res.retentions.sort((x, y) => y.week - x.week);
                }
            }
        }

        let responseToReturn: Array<IMeasurableReport> = [];
        let responseObject = {} as IMeasurableReport;
        let currentWeekNumber = moment().week();

        for (let res of result) {
            responseObject = {
               ...(new User().toResponse(res)),
                measurables: [],
                revenues: [],
                retentions: []
            };

            for (let measurable of res.measurables) {
                 let avgCumObj: IMeasurableResponse & { average?: number; cumulative?: number;customValues: Array<ICustomMeasurableValueResponse>} = {...(new Measurable().toResponse(measurable)), customValues: []};

                if (measurable.showAverage && measurable.averageStartDate) {
                    let averageStartDateWeekNumber = moment(measurable.averageStartDate).week();
                    switch(measurable.unit){
                      case GoalUnits.Revenue:
                        let revenueToShow = res.revenues.filter(x => x.week >= averageStartDateWeekNumber && x.week <= currentWeekNumber);
                        avgCumObj.average = revenueToShow.reduce((accumulator, currentValue) => accumulator + currentValue.revenue, 0) / revenueToShow.length;
                      break;
                      case GoalUnits.RetentionRate:
                        let retentionToShow = res.retentions.filter(x => x.week >= averageStartDateWeekNumber && x.week <= currentWeekNumber);
                        avgCumObj.average = retentionToShow.reduce((accumulator, currentValue) => accumulator + parseFloat((currentValue.retained/ (currentValue.appointments ? (currentValue.appointments/100):1)).toFixed(2)), 0) / retentionToShow.length;
                        avgCumObj.average = parseFloat(avgCumObj.average .toFixed(2))
                      break;
                      case GoalUnits.Custom:
                          let customToShow = measurable.customValues.filter(x => x.week >= averageStartDateWeekNumber && x.week <= currentWeekNumber);
                          avgCumObj.average = customToShow.reduce((accumulator, currentValue) => accumulator + currentValue.value, 0) / customToShow.length;
                          avgCumObj.average = parseFloat(avgCumObj.average.toFixed(2))

                      break;
                    }
                    // if(measurable.unit === GoalUnits.Revenue ){
                    //   let revenueToShow = res.revenues.filter(x => x.week >= averageStartDateWeekNumber && x.week <= currentWeekNumber);
                    //   avgCumObj.average = revenueToShow.reduce((accumulator, currentValue) => accumulator + currentValue.revenue, 0) / revenueToShow.length;
                    // } else {
                    //   let retentionToShow = res.retentions.filter(x => x.week >= averageStartDateWeekNumber && x.week <= currentWeekNumber);
                    //   avgCumObj.average = retentionToShow.reduce((accumulator, currentValue) => accumulator + parseFloat((currentValue.retained/ (currentValue.appointments ? (currentValue.appointments/100):1)).toFixed(2)), 0) / retentionToShow.length;
                    //   avgCumObj.average = parseFloat(avgCumObj.average .toFixed(2))
                    // }
                }

                if (measurable.showCumulative && measurable.cumulativeStartDate) {
                    let cumulativeStartDateWeekNumber = moment(measurable.cumulativeStartDate).week();
                    switch(measurable.unit){
                      case GoalUnits.Revenue:
                        let revenueToShow = res.revenues.filter(x => x.week >= cumulativeStartDateWeekNumber && x.week <= currentWeekNumber);
                        avgCumObj.cumulative = revenueToShow.reduce((accumulator, currentValue) => accumulator + currentValue.revenue, 0);
                      break;
                      case GoalUnits.RetentionRate:
                        let retentionToShow = res.retentions.filter(x => x.week >= cumulativeStartDateWeekNumber && x.week <= currentWeekNumber);
                      avgCumObj.cumulative = retentionToShow.reduce((accumulator, currentValue) => accumulator + currentValue.retained, 0);
                      break;
                      case GoalUnits.Custom:
                        let customToShow = measurable.customValues.filter(x => x.week >= cumulativeStartDateWeekNumber && x.week <= currentWeekNumber);
                        avgCumObj.cumulative = customToShow.reduce((accumulator, currentValue) => accumulator + currentValue.value, 0);

                      break;
                    }
                    // if(measurable.unit === GoalUnits.Revenue ){
                    //   let revenueToShow = res.revenues.filter(x => x.week >= cumulativeStartDateWeekNumber && x.week <= currentWeekNumber);
                    //   avgCumObj.cumulative = revenueToShow.reduce((accumulator, currentValue) => accumulator + currentValue.revenue, 0);
                    // } else {
                    //   let retentionToShow = res.retentions.filter(x => x.week >= cumulativeStartDateWeekNumber && x.week <= currentWeekNumber);
                    //   avgCumObj.cumulative = retentionToShow.reduce((accumulator, currentValue) => accumulator + currentValue.retained, 0);

                    // }

                }
                avgCumObj.customValues = measurable.customValues.map(x => new CustomMeasurableValue().toResponse(x))
                responseObject.measurables.push(avgCumObj);
            }
            responseObject.revenues = res.revenues.map(x => new Revenue().toResponse(x));
            responseObject.retentions = res.retentions.map(x => new Retention().toResponse(x));
            responseToReturn.push(responseObject);
        }

        return responseToReturn;
    }

    async reportTotals(accountId: string): Promise<IReportTotals>{
      let res = await this.accountRepository.aggregate<IReportTotals>(reportTotalsQuery(accountId, moment().get('year')));
      return res.length > 0? res[0] : { totalRevenue: 0, totalAppointments: 0, totalRetained: 0, retention: 0 };
    }
}


