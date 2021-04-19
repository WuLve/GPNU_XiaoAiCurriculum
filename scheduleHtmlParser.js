//2021/4/20
function vzin(me) {
    const timeThruster = (timeRaw, distance) => {
        let [timeRawHour, timeRawMinute] = timeRaw.split(':')
        let increasedMinute = Number(timeRawMinute) + distance
        let timeHour = Number(timeRawHour) + parseInt(increasedMinute / 60)
        let timeMinute = increasedMinute % 60
        if (timeHour < 10) timeHour = "0" + timeHour
        if (timeMinute < 10) timeMinute = "0" + timeMinute
        return timeHour + ':' + timeMinute
    }
    ['longRestAt', 'spClassAt', 'spRestAt'].forEach(e => {
        if (typeof (me[e]) == 'undefined') me[e] = []
    })
    me.sunRisesAt.forEach((e, i) => {
        me.sunRisesAt[i] = e.slice(0, 2) + ':' + e.slice(2, 4)
    })
    var i = 1, you = []
    for (t in me.painCounts) {
        let cBeginTime = me.sunRisesAt[t]
        for (let x = me.painCounts[t] + i; i < x; i++) {
            let cEndTime = timeThruster(cBeginTime, ~me.spClassAt.indexOf(i) ? me.spClassKeeps : me.classKeeps)
            you.push({ section: i, startTime: cBeginTime, endTime: cEndTime })
            cBeginTime = timeThruster(cEndTime, ~me.longRestAt.indexOf(i) ? me.longRest : (~me.spRestAt.indexOf(i) ? me.spRest : me.shortRest))
        }
    }
    console.log('%c TriLingvo %c 星凰·维新|版本 2.4\n\t维新生成了时间信息，请核对：', 'color:#fff;background-color:#fa7298;border-radius:8px', '')
    console.log(you)
    return you
}

function weekStr2IntList(week) {
    week.replace(/，/g, ',')
    let weeks = []
    week.split(",").forEach(w => {
        if (~w.search('-')) {
            let range = w.split("-")
            for (let i = parseInt(range[0]); i <= parseInt(range[1]); i++) {
                if (!weeks.includes(i)) {
                    weeks.push(i);
                }
            }
        } else if (w.length) {
            let v = parseInt(w);
            if (!weeks.includes(v)) {
                weeks.push(v);
            }
        }
    })
    return weeks
}

function getSections(str) {
    let jc = str.split('-')
    let sections = []
    for (let i = parseInt(jc[0]); i <= parseInt(jc[jc.length - 1]); i++) {
        sections.push({ section: i })
    }
    return sections
}

function getTime(str) {
    let t = str.split('节)')
    let weekStr = t[1].replace(/周/g, '')
    let weeks = getWeeks(weekStr)
    return [weeks, getSections(t[0].replace('(', ''))]
}

function getWeeks(str) {
    let weeks = []
    str.split(",").forEach(e => {
        let flag = 0
        if (e.search('单') != -1) {
            flag = 1
            e = e.replace('单', '')
        } else if (e.search('双') != -1) {
            flag = 2
            e = e.replace('双', '')
        }
        weeks = weeks.concat(weekStr2IntList(e).filter((v) => {
            if (flag === 1) {
                return v % 2 === 1
            } else if (flag === 2) {
                return v % 2 === 0
            }
            return v
        }))
    })
    return weeks
}

//获取校区
function getCampus(str) {
  let Campus = 0
  if (str.search('东校区') != -1) {
      Campus = 1
  } else if (str.search('白云校区') != -1) {
      Campus = 2
  } else if (str.search('西校区') != -1) {
      Campus = 3
  } else if (str.search('北校区') != -1) {
      Campus = 4
  } else if (str.search('河源校区') != -1) {
      Campus = 5
  }
  return Campus
}


// 解析列表模式
function parseList(html) {
    let _tri
    let result = []
    const $ = cheerio.load(html, { decodeEntities: false })
    $('#kblist_table tbody').each(function (weekday) {
        if (weekday > 0) {
            $(this).find('tr').each(function (index) {
                if (index > 0) {
                    let course = {}
                    $(this).find('td').each(function (i) {//_tri 修复部分课程无节数信息的问题
                        if (i == 0 && !/[\u4e00-\u9fa5]/.test($(this).text())) {
                            course.sections = getSections($(this).text())
                            _tri = course.sections
                        } else {
                            course.sections = _tri
                            course.name = $(this).find('.title').text() //.slice(0, -1)//去除末尾特殊字符(如果有就一定要去掉) //.replace('【调】', '') //去除调课前缀
                            let info = []
                            $(this).find('p font').each(function () {
                                let text = $(this).text().trim()
                                if (~text.search('上课地点')) {
                                  text = text.replace('上课地点：', '')
                                }
                                info.push(text.split('：')[1]) //.replace('本部 ', '')) //去除地点的多余前缀 '本部'根据情况自行修改
                            })
                            let weekStr = info[0].replace(/周/g, '')
                            course.weeks = getWeeks(weekStr)
                            course.teacher = info[2]
                            course.position = info[1] //.replace(/\)|）/, '').replace(/\(|（|楼/g, '-') //将"xx楼505(xx实验室)" 变为"xx-505-xx实验室" 更简洁
                            course.day = weekday
                        }
                    })
                    result.push(course)
                }
            })
        }
    })
    return result
}

function scheduleHtmlParser(html) {
    
    let result = []
    result = parseList(html)
    console.log(result)
    let Cmapus=getCampus(result[0].position)
    if(Cmapus==1||Cmapus==3||Cmapus==4){
      return {
        courseInfos: result, sectionTimes: vzin({
            classKeeps: 40,                                //课程时长(分钟)
            shortRest: 10,                                 //短课间休息时长(分钟)
            //longRest: 20,                                //长课间休息时长(分钟)     此项可省略
            //longRestAt: [2,6],                           //长课间休息在哪些节数后   此项可省略
            sunRisesAt: ["0820", "1330", "1840"],          //各时间段课程开始时间(HHmm)
            painCounts: [4,4,3],                           //各时间段课程节数
        })
      }
    }else if(Cmapus==2){
      return {
        courseInfos: result, sectionTimes: vzin({
            classKeeps: 40,                                //课程时长(分钟)
            shortRest: 5,                                  //短课间休息时长(分钟)
            longRest: 10,                                  //长课间休息时长(分钟)     此项可省略
            longRestAt: [2, 6],                            //长课间休息在哪些节数后   此项可省略
            sunRisesAt: ["0830", "1330", "1840"],          //各时间段课程开始时间(HHmm)
            painCounts: [4,4,3],                          //各时间段课程节数
        })
      }
    }else if(Cmapus==5){
      return {
        courseInfos: result, sectionTimes: vzin({
            classKeeps: 40,                                //课程时长(分钟)
            shortRest: 10,                                 //短课间休息时长(分钟)
            //longRest: 20,                                //长课间休息时长(分钟)     此项可省略
            //longRestAt: [2, 6],                          //长课间休息在哪些节数后   此项可省略
            sunRisesAt: ["0820", "1350", "1840"],          //各时间段课程开始时间(HHmm)
            painCounts: [4,4,3],                           //各时间段课程节数
        })
      }
    }
}