var calendar = {
   tbl: null,
   init: function () {
      this.tbl= $('table.calendar');
      var d = new Date();
      var year = d.getMonth() > 8 ? d.getFullYear() + 1 : d.getFullYear()
      this.initUI(year);
      this.renderCalendar(year);
   },
   initUI: function(year) {
      var self=this;
      $('input[type=radio][name=size]').change(function () {
         if ('a4'===this.value) {
            $('table.calendar').addClass('a4');
         }
         else {
            $('table.calendar').removeClass('a4');
         }
      });
      for(var y=year-2;y<=year+1;y++) {
         $('<label class="btn btn-sm btn-default'+(y==year?' active':'')+'"><input type="radio" name="year" value="'+y+'" '+(y==year?' checked':'')+'>'+y+'</label>').appendTo($('#year-list'));
      }
      $('input[type=radio][name=year]').change(function () {
         self.renderCalendar(this.value);
      });
      $('#print').click(function () {
         window.print();
      });
   },
   renderCalendar: function(year) {
      var self=this;
      $.when(this.loadHolidays(year))
      .then(function(holidays){
         for(var m = 1; m <= 12; m++) {
            self.renderMonth(year,m,holidays);
         }
         $('.year-title',this.tbl).html(year+' год'); // заголовок
      });
   },
   renderMonth: function(year,month,holidays) {
      var firstDay = new Date(year, month-1, 1);
      var startDay=firstDay.getDay() === 0 ? 7 : firstDay.getDay();
      var date=firstDay;
      var moonPhaseEndOfDay=(SunCalc.getMoonIllumination(firstDay)).phase;
      for(var c=1; c<=6; c++) {
         for(var r=1; r<=7; r++) {
            var cell=$('tr.r'+r+' td.m'+month+'.c'+c,this.tbl);
            if (c === 1 && r < startDay) { // начало месяца
               cell.removeClass('holiday shortday');
               cell.html('');
            }
            else if (date.getMonth() != month-1) { // конец месяца
               cell.removeClass('holiday shortday');
               cell.html('');
            }
            else {
               cell.removeClass('holiday shortday');
               cell.html(date.getDate());
               if (this.isHoliday(date,holidays)) {
                  cell.addClass('holiday');
               }
               if (this.isShortday(date,holidays)) {
                  cell.addClass('shortday');
               }
               var moonPhase=moonPhaseEndOfDay;
               date.setDate(date.getDate()+1);
               moonPhaseEndOfDay=(SunCalc.getMoonIllumination(date)).phase;

               if (moonPhase > moonPhaseEndOfDay) {
                 cell.append('<div class="moon moon-new"></div>');
               }
               else if (moonPhase <= 0.25 && moonPhaseEndOfDay > 0.25) {
                 cell.append('<div class="moon moon-first"></div>');
               }
               else if (moonPhase <= 0.5 && moonPhaseEndOfDay > 0.5) {
                 cell.append('<div class="moon moon-full"></div>');
               }
               else if (moonPhase <= 0.75 && moonPhaseEndOfDay > 0.75) {
                 cell.append('<div class="moon moon-last"></div>');
               }
            }
         }
      }
   },
   loadHolidays: function(year) {
      return $.Deferred(function(dfd) {
         $.ajax({
            url: 'https://raw.githubusercontent.com/xmlcalendar/data/master/ru/'+year+'/calendar.xml',
            dataType: 'xml'
         }).done(function(xml) {
            var days=$(xml).find('day');
            var result={};
            $.each(days, function (key, val) {
               var m=$(val).attr('d').split('.');
               result[(new Date(year, m[0]-1, m[1])).toDateString()]=$(val).attr('t');
            });
            dfd.resolve(result);
         }).error(function(xml) {
            $('<div id="floating_alert" class="alert alert-warning fade in"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>Не удалось загрузить производственный календарь для указанного года.&nbsp;&nbsp;</div>').appendTo('body');
            setTimeout(function () {
                $(".alert").alert('close');
            }, 3000);
            dfd.resolve({});
         });
      }).promise();
   },
   isHoliday: function(date,holidays) {
      if (holidays.hasOwnProperty(date.toDateString())) {
         return holidays[date.toDateString()] === '1';
      }
      else {
         return date.getDay() === 0 || date.getDay() === 6;
      }
   },
   isShortday: function(date,holidays) {
      return holidays.hasOwnProperty(date.toDateString()) && holidays[date.toDateString()] === '2';
   },
};

$(function () {
   "use strict";
   calendar.init();
});