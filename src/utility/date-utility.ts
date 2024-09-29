import moment from "moment"

export const getWorkDaysOfYearfromDate = (date: Date = new Date()) => {
    let month = moment(date).get('month');
    let firstDayOfYear = month > 5 ? moment(date).set('month', 6).startOf('month').startOf('day') : moment(date).add(-1, 'year').set('month', 6).startOf('month').startOf('day');
    // let firstDayOfYear = moment(date).startOf('month');
    let lastDayOfYear = firstDayOfYear.clone().add(1, 'year');
    let incrementalDate = firstDayOfYear.clone();
    let yearWorkDays: Array<Date> = [];

    while(incrementalDate.isBefore(lastDayOfYear)){
        if(incrementalDate.get('day') > 0 && incrementalDate.get('day') < 6) yearWorkDays.push(incrementalDate.utc(true).startOf('day').toDate());
        incrementalDate.add(1, 'day');
    }
    
    return {days: yearWorkDays.length, dates: yearWorkDays, startDate: firstDayOfYear.toDate(), endDate: lastDayOfYear.toDate()};    
}

export const getWorkDaysOfMonthfromDate = (date: Date = new Date()) => {
    let firstDayOfMonth = moment(date).startOf('month');
    let lastDayOfMonth = moment(date).endOf('month');
    let incrementalDate = moment(date).startOf('month');
    let monthWorkDays: Array<Date> = [];

    while(incrementalDate.isBefore(lastDayOfMonth)){
        if(incrementalDate.get('day') > 0 && incrementalDate.get('day') < 6) monthWorkDays.push(incrementalDate.utc(true).startOf('day').toDate());
        incrementalDate.add(1, 'day');
    }

    return {days: monthWorkDays.length, dates: monthWorkDays, startDate: firstDayOfMonth.toDate(), endDate: lastDayOfMonth.toDate()};    
}

export const getWorkDaysOfCustomDateRange = (startDate: Date, endDate: Date) => {
    let firstDayOfMonth = moment(startDate).utc().startOf('day');
    let lastDayOfMonth = moment(endDate).utc().endOf('day');
    let incrementalDate = moment(startDate).utc().startOf('day');
    let monthWorkDays: Array<Date> = [];

    while(incrementalDate.isBefore(lastDayOfMonth)){
        if(incrementalDate.get('day') > 0 && incrementalDate.get('day') < 6) monthWorkDays.push(incrementalDate.utc(true).startOf('day').toDate());
        incrementalDate.add(1, 'day');
    }

    return {days: monthWorkDays.length, dates: monthWorkDays, startDate: firstDayOfMonth.toDate(), endDate: lastDayOfMonth.toDate()};    
}

export const getWorkDaysOfWeekfromDate = (date: Date = new Date()) => {
    let firstDayOfWeek = moment(date).startOf('week');
    let lastDayOfWeek = moment(date).endOf('week');
    let incrementalDate = moment(date).startOf('week');
    let weekWorkDays: Array<Date> = [];

    while(incrementalDate.isBefore(lastDayOfWeek)){
        if(incrementalDate.get('day') > 0 && incrementalDate.get('day') < 6) weekWorkDays.push(incrementalDate.utc(true).startOf('day').toDate());
        incrementalDate.add(1, 'day');
    }

    return {days: weekWorkDays.length, dates: weekWorkDays, startDate: firstDayOfWeek.toDate(), endDate: lastDayOfWeek.toDate()};    
}

export const weekProducer = () => {
    let reportWeekData = [];
    for (let d = moment().startOf('year'); d.isBefore(new Date); d.add(1, 'week')) {
        let currentWeek = d.get('week');
        let weekStart = d.clone().utc().day(1).startOf('d');
        let weekEnd = d.clone().utc().day(5).startOf('d');        
        let year = d.clone().utc().get('year');        


        reportWeekData.push({
            label: `${weekStart.format('yyyy/MM-DD')} - ${weekEnd.format('yyyy/MM-DD')}`,
            startDate: weekStart.utc().toDate(),
            endDate: weekEnd.utc().toDate(),
            week: currentWeek,
            year
        })
    }

    return reportWeekData;
}