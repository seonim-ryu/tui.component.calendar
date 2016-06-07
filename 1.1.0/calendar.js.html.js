ne.util.defineNamespace("fedoc.content", {});
fedoc.content["calendar.js.html"] = "      <div id=\"main\" class=\"main\">\n\n\n\n    \n    <section>\n        <article>\n            <pre class=\"prettyprint source linenums\"><code>/**\n * @fileoverview Calendar component(from Pug component)\n * @author NHN Ent. FE dev team. &lt;dl_javascript@nhnent.com>\n * @dependency jquery ~1.8.3, ne-code-snippet ~1.0.2\n */\n\n'use strict';\nvar utils = require('./utils');\n\nvar util = ne.util,\n    CONSTANTS = {\n        relativeMonthValueKey: 'relativeMonthValue',\n        prevYear: 'prev-year',\n        prevMonth: 'prev-month',\n        nextYear: 'next-year',\n        nextMonth: 'next-month',\n        calendarHeader: null,\n        calendarBody: null,\n        calendarFooter: null,\n        defaultClassPrefixRegExp: /calendar-/g,\n        titleRegExp: /yyyy|yy|mm|m|M/g,\n        titleYearRegExp: /yyyy|yy/g,\n        titleMonthRegExp: /mm|m|M/g,\n        todayRegExp: /yyyy|yy|mm|m|M|dd|d|D/g\n    };\n\nCONSTANTS.calendarHeader = [\n    '&lt;div class=\"calendar-header\">',\n    '&lt;a href=\"#\" class=\"rollover calendar-btn-' + CONSTANTS.prevYear + '\">이전해&lt;/a>',\n    '&lt;a href=\"#\" class=\"rollover calendar-btn-' + CONSTANTS.prevMonth + '\">이전달&lt;/a>',\n    '&lt;strong class=\"calendar-title\">&lt;/strong>',\n    '&lt;a href=\"#\" class=\"rollover calendar-btn-' + CONSTANTS.nextMonth + '\">다음달&lt;/a>',\n    '&lt;a href=\"#\" class=\"rollover calendar-btn-' + CONSTANTS.nextYear + '\">다음해&lt;/a>',\n    '&lt;/div>'].join('');\n\nCONSTANTS.calendarBody = [\n    '&lt;div class=\"calendar-body\">',\n        '&lt;table>',\n            '&lt;thead>',\n                '&lt;tr>',\n                   '&lt;th class=\"calendar-sun\">Su&lt;/th>&lt;th>Mo&lt;/th>&lt;th>Tu&lt;/th>&lt;th>We&lt;/th>&lt;th>Th&lt;/th>&lt;th>Fa&lt;/th>&lt;th class=\"calendar-sat\">Sa&lt;/th>',\n                '&lt;/tr>',\n            '&lt;/thead>',\n            '&lt;tbody>',\n                '&lt;tr class=\"calendar-week\">',\n                    '&lt;td class=\"calendar-date\">&lt;/td>',\n                    '&lt;td class=\"calendar-date\">&lt;/td>',\n                    '&lt;td class=\"calendar-date\">&lt;/td>',\n                    '&lt;td class=\"calendar-date\">&lt;/td>',\n                    '&lt;td class=\"calendar-date\">&lt;/td>',\n                    '&lt;td class=\"calendar-date\">&lt;/td>',\n                    '&lt;td class=\"calendar-date\">&lt;/td>',\n                '&lt;/tr>',\n            '&lt;/tbody>',\n        '&lt;/table>',\n    '&lt;/div>'].join('');\n\nCONSTANTS.calendarFooter = [\n    '&lt;div class=\"calendar-footer\">',\n        '&lt;p>오늘 &lt;em class=\"calendar-today\">&lt;/em>&lt;/p>',\n    '&lt;/div>'].join('');\n\n\n/**\n * Calendar component class\n * @constructor\n * @param {Object} [option] A options for initialize\n *     @param {HTMLElement} option.element A root element\n *     @param {string} [option.classPrefix=\"calendar-\"] A prefix class for markup structure\n *     @param {number} [option.year=this year] A year for initialize\n *     @param {number} [option.month=this month] A month for initialize\n *     @param {string} [option.titleFormat=\"yyyy-mm\"] A title format. This component find title element by className '[prefix]title'\n *     @param {string} [option.todayFormat = \"yyyy Year mm Month dd Day (D)\"] A today format. This component find today element by className '[prefix]today'\n *     @param {string} [option.yearTitleFormat = \"yyyy\"] A year title formant. This component find year title element by className '[prefix]year'\n *     @param {string} [option.monthTitleFormat = \"m\"] A month title format. This component find month title element by className이 '[prefix]month'\n *     @param {Array} [option.monthTitles = [\"JAN\",\"FEB\",\"MAR\",\"APR\",\"MAY\",\"JUN\",\"JUL\",\"AUG\",\"SEP\",\"OCT\",\"NOV\",\"DEC\"]] A label of each month.\n *     @param {Array} [option.dayTitles = [\"Sun\",\"Mon\",\"Tue\",\"Wed\",\"Thu\",\"Fri\",\"Sat\"]] A label for day. If you set the other option todayFormat 'D', you can use this name. \n * @example\n * var calendar = new ne.component.Calendar({\n *                    element: '#layer',\n *                    classPrefix: \"calendar-\",\n *                    year: 1983,\n *                    month: 5,\n *                    titleFormat: \"yyyy-mm\", // title\n *                    todayFormat: \"yyyy / mm / dd (D)\" // today\n *                    yearTitleFormat: \"yyyy\", // year title\n *                    monthTitleFormat: \"m\", // month title\n *                    monthTitles: [\"JAN\", \"FEB\", \"MAR\", \"APR\", \"MAY\", \"JUN\", \"JUL\", \"AUG\", \"SEP\", \"OCT\", \"NOV\", \"DEC\"], \n *                    dayTitles: ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] // 요일들\n *             });\n **/\nvar Calendar = util.defineClass( /** @lends Calendar.prototype */ {\n    init: function(option) {\n        /**\n         * Set options\n         * option: {\n         *     classPrefix: string,\n         *     year: number\n         *     month: number\n         *     titleFormat: string,\n         *     todayFormat: string,\n         *     yearTitleFormat: string,\n         *     monthTitleFormat: string,\n         *     monthTitles: Array,\n         *     dayTitles: Array,\n         * }\n         * @private\n         */\n        this._option = {};\n\n        /**\n         * A day that is shown\n         * @type {{year: number, month: number}}\n         */\n        this._shownDate = {year: 0, month: 1, date: 1};\n\n        /**======================================\n         * jQuery - HTMLElement\n         *======================================*/\n        /**\n         * =========Root Element=========\n         * If options do not include element, this component jedge initialize element without options\n         * @type {jQuery}\n         * @private\n         */\n        this.$element = $(option.element || arguments[0]);\n\n        /**\n         * =========Header=========\n         * @type {jQuery}\n         */\n        this.$header = null;\n\n        /**\n         * A tilte\n         * @type {jQuery}\n         */\n        this.$title = null;\n\n        /**\n         * A year title\n         * @type {jQuery}\n         */\n        this.$titleYear = null;\n\n        /**\n         * A month title\n         * @type {jQuery}\n         */\n        this.$titleMonth = null;\n\n        /**\n         * =========Body=========\n         * @type {jQuery}\n         */\n        this.$body = null;\n\n        /**\n         * A template of week\n         * @type {jQuery}\n         */\n        this.$weekTemplate = null;\n\n        /**\n         * A week parent element \n         * @type {jQuery}\n         */\n        this.$weekAppendTarget = null;\n\n        /**-------- footer --------*/\n        this.$footer = null;\n\n        /** Today */\n        this.$today = null;\n\n        /**\n         * A date element\n         * @type {jQuery}\n         * @private\n         */\n        this._$dateElement = null;\n\n        /**\n         * A date wrapper element\n         * @type {jQuery}\n         * @private\n         */\n        this._$dateContainerElement = null;\n\n        /**\n         * =========Footer=========\n         * @type {jQuery}\n         */\n        this.$footer = null;\n\n        /**\n         * Today element\n         * @type {jQuery}\n         */\n        this.$today = null;\n\n        /** Set default options */\n        this._setDefault(option);\n    },\n\n    /**\n     * Set defulat opitons\n     * @param {Object} [option] A options to initialzie component\n     * @private\n     */\n    _setDefault: function(option) {\n        this._setOption(option);\n        this._assignHTMLElements();\n        this.draw(this._option.year, this._option.month, false);\n    },\n\n    /**\n     * Save options\n     * @param {Object} [option] A options to initialize component\n     * @private\n     */\n    _setOption: function(option) {\n        var instanceOption = this._option,\n            today = utils.getDateHashTable();\n\n        var defaultOption = {\n            classPrefix: 'calendar-',\n            year: today.year,\n            month: today.month,\n            titleFormat: 'yyyy-mm',\n            todayFormat: 'yyyy/mm/dd (D)',\n            yearTitleFormat: 'yyyy',\n            monthTitleFormat: 'm',\n            monthTitles: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'],\n            dayTitles: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']\n        };\n        util.extend(instanceOption, defaultOption, option);\n    },\n\n    /**\n     * Set element to filed\n     * @private\n     */\n    _assignHTMLElements: function() {\n        var classPrefix = this._option.classPrefix,\n            $element = this.$element,\n            classSelector = '.' + classPrefix;\n\n        this._assignHeader($element, classSelector, classPrefix);\n        this._assignBody($element, classSelector, classPrefix);\n        this._assignFooter($element, classSelector, classPrefix);\n    },\n\n    /**\n     * Register header element.\n     * @param {jQuery} $element The root element of component\n     * @param {string} classSelector A class selector\n     * @param {string} classPrefix A prefix for class\n     * @private\n     */\n    _assignHeader: function($element, classSelector, classPrefix) {\n        var $header = $element.find(classSelector + 'header'),\n            headerTemplate,\n            defaultClassPrefixRegExp,\n            key = CONSTANTS.relativeMonthValueKey,\n            btnClassName = 'btn-';\n\n        if (!$header.length) {\n            headerTemplate = CONSTANTS.calendarHeader;\n            defaultClassPrefixRegExp = CONSTANTS.defaultClassPrefixRegExp;\n\n            $header = $(headerTemplate.replace(defaultClassPrefixRegExp, classPrefix));\n            $element.append($header);\n        }\n        // button\n        $header.find(classSelector + btnClassName + CONSTANTS.prevYear).data(key, -12);\n        $header.find(classSelector + btnClassName + CONSTANTS.prevMonth).data(key, -1);\n        $header.find(classSelector + btnClassName + CONSTANTS.nextYear).data(key, 12);\n        $header.find(classSelector + btnClassName + CONSTANTS.nextMonth).data(key, 1);\n\n        // title text\n        this.$title = $header.find(classSelector + 'title');\n        this.$titleYear = $header.find(classSelector + 'title-year');\n        this.$titleMonth = $header.find(classSelector + 'title-month');\n        this.$header = $header;\n        this._attachEventToRolloverBtn();\n    },\n\n    /**\n     * Register body element\n     * @param {jQuery} $element The root elment of component\n     * @param {string} classSelector A selector \n     * @param {string} classPrefix A prefix for class\n     * @private\n     */\n    _assignBody: function($element, classSelector, classPrefix) {\n        var $body = $element.find(classSelector + 'body'),\n            $weekTemplate,\n            bodyTemplate,\n            defaultClassPrefixRegExp;\n\n        if (!$body.length) {\n            bodyTemplate = CONSTANTS.calendarBody;\n            defaultClassPrefixRegExp = CONSTANTS.defaultClassPrefixRegExp;\n\n            $body = $(bodyTemplate.replace(defaultClassPrefixRegExp, classPrefix));\n            $element.append($body);\n        }\n        $weekTemplate = $body.find(classSelector + 'week');\n        this.$weekTemplate = $weekTemplate.clone(true);\n        this.$weekAppendTarget = $weekTemplate.parent();\n        this.$body = $body;\n    },\n\n    /**\n     * Register footer element\n     * @param {jQuery} $element The root element of component\n     * @param {string} classSelector A selector\n     * @param {string} classPrefix A prefix for class\n     * @private\n     */\n    _assignFooter: function($element, classSelector, classPrefix) {\n        var $footer = $element.find(classSelector + 'footer'),\n            footerTemplate,\n            defaultClassPrefixRegExp;\n\n        if (!$footer.length) {\n            footerTemplate = CONSTANTS.calendarFooter;\n            defaultClassPrefixRegExp = CONSTANTS.defaultClassPrefixRegExp;\n\n            $footer = $(footerTemplate.replace(defaultClassPrefixRegExp, classPrefix));\n            $element.append($footer);\n        }\n        this.$today = $footer.find(classSelector + 'today');\n        this.$footer = $footer;\n    },\n\n    /**\n     * Set navigation event\n     * @private\n     */\n    _attachEventToRolloverBtn: function() {\n        var btns = this.$header.find('.rollover');\n\n        btns.on('click', util.bind(function() {\n            var relativeMonthValue = $(event.target).data(CONSTANTS.relativeMonthValueKey);\n            this.draw(0, relativeMonthValue, true);\n            event.preventDefault();\n        }, this));\n    },\n\n    /**\n     * Get Hash data to drow calendar\n     * @param {number} year A year\n     * @param {number} month A month\n     * @param {boolean} [isRelative]  Whether is related other value or not\n     * @returns {{year: number, month: number}} A date hash\n     * @private\n     */\n    _getDateForDrawing: function(year, month, isRelative) {\n        var nDate = this.getDate(),\n            relativeDate;\n\n        nDate.date = 1;\n        if (!util.isNumber(year) &amp;&amp; !util.isNumber(month)) {\n            return nDate;\n        }\n\n        if (isRelative) {\n            relativeDate = utils.getRelativeDate(year, month, 0, nDate);\n            nDate.year = relativeDate.year;\n            nDate.month = relativeDate.month;\n        } else {\n            nDate.year = year || nDate.year;\n            nDate.month = month || nDate.month;\n        }\n\n        return nDate;\n    },\n\n    /**\n     * Judge to redraw calendar\n     * @param {number} year A year\n     * @param {number} month A month\n     * @returns {boolean} reflow \n     * @private\n     */\n    _isNecessaryForDrawing: function(year, month) {\n        var shownDate = this._shownDate;\n\n        return (shownDate.year !== year || shownDate.month !== month);\n    },\n\n    /**\n     * Draw calendar text\n     * @param {{year: number, month: number}} dateForDrawing Tha hash that show up on calendar \n     * @private\n     */\n    _setCalendarText: function(dateForDrawing) {\n        var year = dateForDrawing.year,\n            month = dateForDrawing.month;\n\n        this._setCalendarToday();\n        this._setCalendarTitle(year, month);\n    },\n\n    /**\n     * Draw dates by month.\n     * @param {{year: number, month: number}} dateForDrawing A date to draw\n     * @param {string} classPrefix A class prefix\n     * @private\n     */\n    _drawDates: function(dateForDrawing, classPrefix) {\n        var year = dateForDrawing.year,\n            month = dateForDrawing.month,\n            dayInWeek = 0,\n            datePrevMonth = utils.getRelativeDate(0, -1, 0, dateForDrawing),\n            dateNextMonth = utils.getRelativeDate(0, 1, 0, dateForDrawing),\n            dates = [],\n            firstDay = utils.getFirstDay(year, month),\n            indexOfLastDate = this._fillDates(year, month, dates);\n\n        util.forEach(dates, function(date, i) {\n            var isPrevMonth = false,\n                isNextMonth = false,\n                $dateContainer = $(this._$dateContainerElement[i]),\n                tempYear = year,\n                tempMonth = month,\n                eventData;\n\n            if (i &lt; firstDay) {\n                isPrevMonth = true;\n                $dateContainer.addClass(classPrefix + CONSTANTS.prevMonth);\n                tempYear = datePrevMonth.year;\n                tempMonth = datePrevMonth.month;\n            } else if (i > indexOfLastDate) {\n                isNextMonth = true;\n                $dateContainer.addClass(classPrefix + CONSTANTS.nextMonth);\n                tempYear = dateNextMonth.year;\n                tempMonth = dateNextMonth.month;\n            }\n\n            // Weekend\n            this._setWeekend(dayInWeek, $dateContainer, classPrefix);\n\n            // Today\n            if (this._isToday(tempYear, tempMonth, date)) {\n                $dateContainer.addClass(classPrefix + 'today');\n            }\n\n            eventData = {\n                $date: $(this._$dateElement.get(i)),\n                $dateContainer: $dateContainer,\n                year: tempYear,\n                month: tempMonth,\n                date: date,\n                isPrevMonth: isPrevMonth,\n                isNextMonth: isNextMonth,\n                html: date\n            };\n            $(eventData.$date).html(eventData.html.toString());\n            dayInWeek = (dayInWeek + 1) % 7;\n\n            /**\n             * Fire draw event when calendar draw each date.\n             * @param {string} type A name of custom event\n             * @param {boolean} isPrevMonth Whether the draw day is last month or not\n             * @param {boolean} isNextMonth Wehter the draw day is next month or not\n             * @param {jQuery} $date The element have date html\n             * @param {jQuery} $dateContainer Child element that has className [prefix]week. It is possible this element equel elDate.\n             * @param {number} date A draw date\n             * @param {number} month A draw month\n             * @param {number} year A draw year\n             * @param {string} html A html string\n             * @example\n             * // draw custom even thandle\n             * calendar.on('draw', function(drawEvent){ ... });\n             **/\n            this.fire('draw', eventData);\n        }, this);\n    },\n\n\n    /**\n     * Jedge the input date is today.\n     * @param {number} year A year\n     * @param {number} month A month\n     * @param {number} date A date\n     * @returns {boolean} \n     * @private\n     */\n    _isToday: function(year, month, date) {\n        var today = utils.getDateHashTable();\n\n        return (\n            today.year === year &amp;&amp;\n            today.month === month &amp;&amp;\n            today.date === date\n        );\n    },\n\n    /**\n     * Make one week tempate.\n     * @param {number} year  A year\n     * @param {number} month A month\n     * @private\n     */\n    _setWeeks: function(year, month) {\n        var $elWeek,\n            weeks = utils.getWeeks(year, month),\n            i;\n        for (i = 0; i &lt; weeks; i += 1) {\n            $elWeek = this.$weekTemplate.clone(true);\n            $elWeek.appendTo(this.$weekAppendTarget);\n            this._weekElements.push($elWeek);\n        }\n    },\n\n    /**\n     * Save draw dates to array\n     * @param {string} year A draw year\n     * @param {string} month A draw month\n     * @param {Array} dates A draw date\n     * @return {number} index of last date\n     * @private\n     */\n    _fillDates: function(year, month, dates) {\n        var firstDay = utils.getFirstDay(year, month),\n            lastDay = utils.getLastDay(year, month),\n            lastDate = utils.getLastDate(year, month),\n            datePrevMonth = utils.getRelativeDate(0, -1, 0, {year: year, month: month, date: 1}),\n            prevMonthLastDate = utils.getLastDate(datePrevMonth.year, datePrevMonth.month),\n            indexOfLastDate,\n            i;\n\n        if (firstDay > 0) {\n            for (i = prevMonthLastDate - firstDay; i &lt; prevMonthLastDate; i += 1) {\n                dates.push(i + 1);\n            }\n        }\n        for (i = 1; i &lt; lastDate + 1; i += 1) {\n            dates.push(i);\n        }\n        indexOfLastDate = dates.length - 1;\n        for (i = 1; i &lt; 7 - lastDay; i += 1) {\n            dates.push(i);\n        }\n\n        return indexOfLastDate;\n    },\n\n    /**\n     * Set weekend\n     * @param {number} day A date\n     * @param {jQuery} $dateContainer A container element for date\n     * @param {string} classPrefix A prefix of class\n     * @private\n     */\n    _setWeekend: function(day, $dateContainer, classPrefix) {\n        if (day === 0) {\n            $dateContainer.addClass(classPrefix + 'sun');\n        } else if (day === 6) {\n            $dateContainer.addClass(classPrefix + 'sat');\n        }\n    },\n\n    /**\n     * Clear calendar\n     * @private\n     */\n    _clear: function() {\n        this._weekElements = [];\n        this.$weekAppendTarget.empty();\n    },\n\n    /**\n     * Draw title with format option.\n     * @param {number} year A value of year (ex. 2008)\n     * @param {(number|string)} month A month (1 ~ 12)\n     * @private\n     **/\n    _setCalendarTitle: function(year, month) {\n        var option = this._option,\n            titleFormat = option.titleFormat,\n            replaceMap,\n            reg;\n\n        month = this._prependLeadingZero(month);\n        replaceMap = this._getReplaceMap(year, month);\n\n        reg = CONSTANTS.titleRegExp;\n        this._setDateTextInCalendar(this.$title, titleFormat, replaceMap, reg);\n\n        reg = CONSTANTS.titleYearRegExp;\n        this._setDateTextInCalendar(this.$titleYear, option.yearTitleFormat, replaceMap, reg);\n\n        reg = CONSTANTS.titleMonthRegExp;\n        this._setDateTextInCalendar(this.$titleMonth, option.monthTitleFormat, replaceMap, reg);\n    },\n\n    /**\n     * Update title\n     * @param {jQuery|HTMLElement} element A update element\n     * @param {string} form A update form\n     * @param {Object} map A object that has value matched regExp\n     * @param {RegExp} reg A regExp to chagne form\n     * @private\n     */\n    _setDateTextInCalendar: function(element, form, map, reg) {\n        var title,\n            $el = $(element);\n\n        if (!$el.length) {\n            return;\n        }\n        title = this._getConvertedTitle(form, map, reg);\n        $el.text(title);\n    },\n\n    /**\n     * Get map data for form\n     * @param {string|number} year A year\n     * @param {string|number} month A month\n     * @param {string|number} [date] A day\n     * @returns {Object} ReplaceMap\n     * @private\n     */\n    _getReplaceMap: function(year, month, date) {\n        var option = this._option,\n            yearSub = (year.toString()).substr(2, 2),\n            monthLabel = option.monthTitles[month - 1],\n            labelKey = new Date(year, month - 1, date || 1).getDay(),\n            dayLabel = option.dayTitles[labelKey];\n\n        return {\n            yyyy: year,\n            yy: yearSub,\n            mm: month,\n            m: Number(month),\n            M: monthLabel,\n            dd: date,\n            d: Number(date),\n            D: dayLabel\n        };\n    },\n\n    /**\n     * Chage text and return.\n     * @param {string} str A text to chagne\n     * @param {Object} map A chagne key, value set\n     * @param {RegExp} reg A regExp to chagne \n     * @returns {string}\n     * @private\n     */\n    _getConvertedTitle: function(str, map, reg) {\n        str = str.replace(reg, function(matchedString) {\n            return map[matchedString] || '';\n        });\n        return str;\n    },\n\n    /**\n     * Set today\n     * @private\n     */\n    _setCalendarToday: function() {\n        var $today = this.$today,\n            todayFormat,\n            today,\n            year,\n            month,\n            date,\n            replaceMap,\n            reg;\n\n        if (!$today.length) {\n            return;\n        }\n\n        today = utils.getDateHashTable();\n        year = today.year;\n        month = this._prependLeadingZero(today.month);\n        date = this._prependLeadingZero(today.date);\n        todayFormat = this._option.todayFormat;\n        replaceMap = this._getReplaceMap(year, month, date);\n        reg = CONSTANTS.todayRegExp;\n        this._setDateTextInCalendar($today, todayFormat, replaceMap, reg);\n    },\n\n    /**\n     * Chagne number 0~9 to '00~09'\n     * @param {number} number number\n     * @returns {string}\n     * @private\n     * @example\n     *  this._prependLeadingZero(0); //  '00'\n     *  this._prependLeadingZero(9); //  '09'\n     *  this._prependLeadingZero(12); //  '12'\n     */\n    _prependLeadingZero: function(number) {\n        var prefix = '';\n\n        if (number &lt; 10) {\n            prefix = '0';\n        }\n        return prefix + number;\n    },\n\n    /**\n     * Draw calendar\n     * @param {number} [year] A year (ex. 2008)\n     * @param {number} [month] A month (1 ~ 12)\n     * @param {Boolean} [isRelative]  A year and month is related\n     * @example\n     * calendar.draw(); // Draw with now date.\n     * calendar.draw(2008, 12); // Draw 2008/12\n     * calendar.draw(null, 12); // Draw current year/12\n     * calendar.draw(2010, null); // Draw 2010/current month\n     * calendar.draw(0, 1, true); // Draw next month\n     * calendar.draw(-1, null, true); // Draw prev year\n     **/\n    draw: function(year, month, isRelative) {\n        var dateForDrawing = this._getDateForDrawing(year, month, isRelative),\n            isReadyForDrawing = this.invoke('beforeDraw', dateForDrawing),\n            classPrefix;\n\n        /**===============\n         * beforeDraw\n         =================*/\n        if (!isReadyForDrawing) {\n            return;\n        }\n\n        /**===============\n         * draw\n         =================*/\n        year = dateForDrawing.year;\n        month = dateForDrawing.month;\n\n        classPrefix = this._option.classPrefix;\n        this._clear();\n        this._setCalendarText(dateForDrawing);\n\n        // weeks\n        this._setWeeks(year, month);\n        this._$dateElement = $('.' + classPrefix + 'date', this.$weekAppendTarget);\n        this._$dateContainerElement = $('.' + classPrefix + 'week > *', this.$weekAppendTarget);\n\n        // dates\n        this.setDate(year, month);\n        this._drawDates(dateForDrawing, classPrefix);\n        this.$element.show();\n\n        /**===============\n         * afterDraw\n         ================*/\n        this.fire('afterDraw', dateForDrawing);\n    },\n\n    /**\n     * Return current year and month(just shown).\n     * @returns {{year: number, month: number}}\n     */\n    getDate: function() {\n        return {\n            year: this._shownDate.year,\n            month: this._shownDate.month\n        };\n    },\n\n    /**\n     * Set date\n     * @param {number} [year] A year (ex. 2008)\n     * @param {number} [month] A month (1 ~ 12)\n     **/\n    setDate: function(year, month) {\n        var date = this._shownDate;\n        date.year = util.isNumber(year) ? year : date.year;\n        date.month = util.isNumber(month) ? month : date.month;\n    }\n});\n\nutil.CustomEvents.mixin(Calendar);\nmodule.exports = Calendar;\n</code></pre>\n        </article>\n    </section>\n\n\n\n</div>\n\n"