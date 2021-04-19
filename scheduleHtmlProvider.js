//2021/4/20
function scheduleHtmlProvider() {
    var sch = document.querySelector('#kblist_table')
    if (!sch) {
        let TriPrompto = `
          ------
          导入流程：
           >> 输入账号密码
           >> 点击右上角头像旁三条横线
           >> 依次: 选课>学生课表查询
           >> 点击<一键导入>
          `
        alert(TriPrompto)
    }
    return sch.outerHTML
}