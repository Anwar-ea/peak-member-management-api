import { inject, injectable } from "tsyringe";
import { IReportingService } from "./abstractions/reporting-service";
import { IUserRepository } from "../dal";
import { Measurable, Retention, Revenue, User } from "../entities";
import { Types } from "mongoose";
import moment from "moment";
import { weekProducer } from "../utility";
import { IMeasurableResponse, ITokenUser } from "../models";
import { IMeasurableReport } from "../models/inerfaces/reports";
import { GoalUnits } from "../models/enums/goals.enum";

@injectable()
export class ReportingService implements IReportingService {
    constructor(@inject('UserRepository') private readonly userRepository: IUserRepository) { }

    async get(contextUser: ITokenUser, userId?: string): Promise<Array<IMeasurableReport>> {
        let matchQuery: Record<string, any> = {
            'active': true, 
            'deleted': false, 
            'accountId': new Types.ObjectId(contextUser.accountId)
        };

        if (userId) {
            matchQuery['_id'] = new Types.ObjectId(userId);
        }

        let result = await this.userRepository.aggregate<User & { measurables: Array<Measurable>, revenues: Array<Revenue>, retentions: Array<Retention> }>(
            [
                {
                  '$match': matchQuery
                }, {
                  '$lookup': {
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
                              }, {
                                '$eq': [
                                  '$active', true
                                ]
                              }, {
                                '$eq': [
                                  '$deleted', false
                                ]
                              }
                            ]
                          }
                        }
                      }
                    ], 
                    'as': 'measurables'
                  }
                }, {
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
                              }, {
                                '$eq': [
                                  '$active', true
                                ]
                              }, {
                                '$eq': [
                                  '$deleted', false
                                ]
                              }, {
                                '$eq': [
                                  '$year', moment().get('year')
                                ]
                              }
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
                                $eq: ["$year", 2024]
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
                 let avgCumObj: IMeasurableResponse & { average?: number; cumulative?: number;} = new Measurable().toResponse(measurable);

                if (measurable.showAverage && measurable.averageStartDate) {
                    let averageStartDateWeekNumber = moment(measurable.averageStartDate).week();
                    if(measurable.unit === GoalUnits.Revenue ){
                      let revenueToShow = res.revenues.filter(x => x.week >= averageStartDateWeekNumber && x.week <= currentWeekNumber);
                      avgCumObj.average = revenueToShow.reduce((accumulator, currentValue) => accumulator + currentValue.revenue, 0) / revenueToShow.length;
                    } else {
                      let retentionToShow = res.retentions.filter(x => x.week >= averageStartDateWeekNumber && x.week <= currentWeekNumber);
                      avgCumObj.average = retentionToShow.reduce((accumulator, currentValue) => accumulator + parseFloat((currentValue.retained/ (currentValue.appointments ? (currentValue.appointments/100):1)).toFixed(2)), 0) / retentionToShow.length;
                      avgCumObj.average = parseFloat(avgCumObj.average .toFixed(2))
                    }
                }

                if (measurable.showCumulative && measurable.cumulativeStartDate) {
                    let cumulativeStartDateWeekNumber = moment(measurable.cumulativeStartDate).week();

                    if(measurable.unit === GoalUnits.Revenue ){
                      let revenueToShow = res.revenues.filter(x => x.week >= cumulativeStartDateWeekNumber && x.week <= currentWeekNumber);
                      avgCumObj.cumulative = revenueToShow.reduce((accumulator, currentValue) => accumulator + currentValue.revenue, 0);
                    } else {
                      let retentionToShow = res.retentions.filter(x => x.week >= cumulativeStartDateWeekNumber && x.week <= currentWeekNumber);
                      avgCumObj.cumulative = retentionToShow.reduce((accumulator, currentValue) => accumulator + currentValue.retained, 0);

                    }
                }
                responseObject.measurables.push(avgCumObj);
            }
            responseObject.revenues = res.revenues.map(x => new Revenue().toResponse(x));
            responseObject.retentions = res.retentions.map(x => new Retention().toResponse(x));
            responseToReturn.push(responseObject);
        }

        return responseToReturn;
    }
}
