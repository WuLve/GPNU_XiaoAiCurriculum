//2021/3/3
function weekStr2IntList(week) {
  // 将全角逗号替换为半角逗号
  week.replace(/，/g, ',');
  let weeks = [];

  // 以逗号为界分割字符串，遍历分割的字符串
  week.split(",").forEach(w => {
      if (w.search('-') != -1) {
          let range = w.split("-");
          let start = parseInt(range[0]);
          let end = parseInt(range[1]);
          for (let i = start; i <= end; i++) {
              if (!weeks.includes(i)) {
                  weeks.push(i);
              }
          }
      } else if (w.length != 0) {
          let v = parseInt(w);
          if (!weeks.includes(v)) {
              weeks.push(v);
          }
      }
  });
  return weeks;
}

function getSections(str) {
  let start = parseInt(str.split('-')[0])
  let end = parseInt(str.split('-')[1])
  let sections = []
  for (let i = start; i <= end; i++) {
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
  let flag = 0
  if (str.search('单') != -1) {
      flag = 1
      str = str.replace('单', '')
  } else if (str.search('双') != -1) {
      flag = 2
      str = str.replace('双', '')
  }
  let weeks = weekStr2IntList(str)
  weeks = weeks.filter((v) => {
      if (flag === 1) {
          return v % 2 === 1
      } else if (flag === 2) {
          return v % 2 === 0
      }
      
      return v
  })
  return weeks
}

// 解析列表模式
function parseList(html) {
  let _tri
  let result = []
  const $ = cheerio.load(html, { decodeEntities: false });
  $('#kblist_table tbody').each(function(weekday) {
      if (weekday > 0) {
          $(this).find('tr').each(function(index) {
              if (index > 0) {
                  let course = {}
                  $(this).find('td').each(function(i) {//_tri 修复部分课程无节数信息的问题
                      if (i == 0 && !/[\u4e00-\u9fa5]/.test($(this).text())) {
                          course.sections = getSections($(this).text())
                          _tri = course.sections
                      } else {
                          course.sections = _tri
                          course.name = $(this).find('.title').text()
                          let info = []
                          $(this).find('p font').each(function() {
                              let text = $(this).text().trim()
                              if (text.search('上课地点') != -1) {
                                  text = text.replace('上课地点：', '')
                              }
                              info.push(text.split('：')[1].replace('广东技术师范大学',''))
                          })
                          let weekStr = info[0].replace(/周/g, '')
                          course.weeks = getWeeks(weekStr)
                          course.teacher = info[2]
                          course.position = info[1]
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
  for (let tri = 0; tri < result.length; tri++){
    result[tri].position = result[tri].position.replace(/\)|）/,'').replace(/\(|（|楼/g,'-')
  }
  let _sectionTimes = [
  {
    "section": 1,
    "startTime": "08:20",
    "endTime": "09:00"
  },{
    "section": 2,
    "startTime": "09:10",
    "endTime": "09:50"
  },{
    "section": 3,
    "startTime": "10:00",
    "endTime": "10:40"
  },{
    "section": 4,
    "startTime": "10:50",
    "endTime": "11:30"
  },{
    "section": 5,
    "startTime": "13:30",
    "endTime": "14:10"
  },{
    "section": 6,
    "startTime": "14:20",
    "endTime": "15:00"
  },{
    "section": 7,
    "startTime": "15:10",
    "endTime": "15:50"
  },{
    "section": 8,
    "startTime": "16:00",
    "endTime": "16:40"
  },{
    "section": 9,
    "startTime": "18:40",
    "endTime": "19:20"
  },{
    "section": 10,
    "startTime": "19:30",
    "endTime": "20:10"
  },{
    "section": 11,
    "startTime": "20:20",
    "endTime": "21:00"
  }]
  return { courseInfos: result, sectionTimes: _sectionTimes }
}