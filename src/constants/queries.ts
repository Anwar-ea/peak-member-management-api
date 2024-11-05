import moment from "moment";
import { PipelineStage, Types } from "mongoose";

export const reportTotalsQuery = (accountId: string, year: number = moment().get('year')): Array<PipelineStage> => {
    return [
        {
          '$match': {
            '_id': new Types.ObjectId(accountId)
          }
        }, {
          '$lookup': {
            'from': 'Revenue', 
            'let': {
              'accountId': '$_id'
            }, 
            'pipeline': [
              {
                '$match': {
                  '$expr': {
                    '$eq': [
                      '$year', year
                    ]
                  }
                }
              }, {
                '$group': {
                  '_id': null, 
                  'revenue': {
                    '$sum': '$revenue'
                  }
                }
              }, {
                '$project': {
                  'revenue': 1
                }
              }
            ], 
            'as': 'rev'
          }
        }, {
          '$unwind': {
            'path': '$rev'
          }
        }, {
          '$lookup': {
            'from': 'Retention', 
            'let': {
              'accountId': '$_id'
            }, 
            'pipeline': [
              {
                '$match': {
                  '$expr': {
                    '$eq': [
                      '$accountId', '$$accountId'
                    ]
                  }
                }
              }, {
                '$group': {
                  '_id': null, 
                  'totalAppointments': {
                    '$sum': '$appointments'
                  }, 
                  'totalRetained': {
                    '$sum': '$retained'
                  }
                }
              }, {
                '$project': {
                  'totalAppointments': 1, 
                  'totalRetained': 1, 
                  'retentionRate': {
                    '$divide': [
                      {
                        '$multiply': [
                          100, '$totalRetained'
                        ]
                      }, '$totalAppointments'
                    ]
                  }
                }
              }
            ], 
            'as': 'ret'
          }
        }, {
          '$unwind': {
            'path': '$ret'
          }
        }, {
          '$project': {
            'totalRevenue': '$rev.revenue', 
            'totalAppointments': '$ret.totalAppointments', 
            'totalRetained': '$ret.totalRetained', 
            'retention': '$ret.retentionRate'
          }
        }
      ]
}