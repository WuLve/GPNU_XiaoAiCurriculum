//2021/3/3

function scheduleHtmlProvider(iframeContent = "", frameContent = "") {
      var sch = document.querySelector('#kblist_table')
      if (!sch){
            let TriPrompto = `
            ---------------
            没有获取到课表哦
            ---------------
            如果无法打开,
            请连接内网登录。
            ---------------
            `
            alert(TriPrompto)
      }
      return sch.outerHTML
}
