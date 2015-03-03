/**
 * @fileoverview 날짜를 선택하는 기능을 구현한다. 특정 범위를 받으면, 그 날짜만 선택 가능하다.
 * @author FE개발팀(이제인 jein.yi@nhnent.com)
 *
 * */
/* istanbul ignore if */
if (!window.ne) {
    window.ne = {};
}
/* istanbul ignore if */
if (!ne.component) {
    ne.component = {};
}

/**
 * 달력 생성
 * 날짜를 선택한다.
 * 선택한 날짜의 클래스를 비교, picker-selectable혹은 사용자가 지정한 클래스를 보유하고 있으면 getYear, getMonth, getDay를 이용해 날짜를 받아온다.
 * 달력 생성/종료시 커스텀 이벤트를 수행한다.
 * @constructor
 *
 * @param {Object} option DatePicker 옵션값
 *      @param {HTMLElement} option.element DatePicker의 input 창
 *      @param {object} option.data
 *        @param {object} option.data.year 연도
 *        @param {object} option.data.month 월
 *        @param {object} option.data.date 일
 *      @param {String} [option.dateForm] input 창에 표시될 날짜 형식
 *      @param {Object} [option.dateForm] 초기 입력 날짜값
 *      @param {String} [option.defaultCentury] yy 형식일때 자동으로 붙여지는 값 [19|20]
 *      @param {Boolean} [option.isRestrict] 선택가능한 날짜 제한 여부
 *      @param {String} [option.selectableClass] 선택가능한 날짜에 입힐 클래스 이름 생락시 'selectableClass'
 *      @param {Object} [option.startDate] 선택가능한 날짜 시작일
 *      @param {Object} [option.endDate] 선택가능한 날짜 종료일
 * @param {ne.component.Calendar} calendar DatePicker 컴포넌트와 연결될 캘린더 컴포넌트
 * */
ne.component.DatePicker = ne.util.defineClass(/**@lends ne.component.DatePicker.prototype */{
    init: function(option, calendar) {
        this._calendar = calendar;
        /**
         * 인풋 엘리먼트
         * @type {HTMLElement}
         * @private
         */
        this._element = option.element;
        /**
         * 날짜 표시 형식
         * @type {String}
         * @private
         */
        this._dateForm = option.dateForm || 'yyyy-mm-dd';
        /**
         * 데이터를 해쉬 형식으로 저장
         *
         * @type {Object}
         * @private
         */
        this._date = option.date;
        /**
         * 달력 엘리먼트
         *
         * @type {HTMLElement}
         * @private
         */
        this._$calendarElement = calendar.getElement();
        /**
         * yy-mm-dd형식으로 인풋창에 값을 직접 입력 할 시, 앞에 자동으로 붙을 숫자.
         * @type {String}
         * @private
         */
        this._defaultCentury = option.defaultCentury || '20';
        /**
         * 선택 영역을 제한하는
         * @type {Boolean}
         * @private
         */
        this._isRestrict = !!option.isRestrict;
        /**
         * (선택 제한시) 선택 가능한 날짜엘리먼트에 추가될 클래스명
         * @type {String}
         * @private
         */
        this._selectableClass = option.selectableClass || 'selectableClass';
        /**
         * (선택 제한시) 선택 할 수 있는 첫 날
         * @type {Date}
         * @private
         */
        this._startEdge = this._isRestrict ? this._getDateObject(option.startDate) : null;
        /**
         * (선택 제한시) 선택 할 수 있는 마지막 날
         * @type {Date}
         * @private
         */
        this._endEdge = this._isRestrict ? this._getDateObject(option.endDate) : null;
        this._bindElementEvent();

        // 기본 데이터가 있으면 input에 띄워준다.
        if (option.date) {
            this.insertDate(option.date);
        }

    },
    /**
     * 인풋 엘리먼트에 클릭시 이벤트 바인딩
     * @private
     */
    _bindElementEvent: function() {
        // 데이트 피커 엘리먼트에 이벤트 바인딩.
        $(this._element).on('click', ne.util.bind(this._onClickPicker, this));
        $(this._element).on('keydown', ne.util.bind(this._onKeydownPicker, this));
    },
    /**
     * 레이어가 펼쳐지면 다른 곳을 클릭할 때 달력을 닫히도록 한다.
     * @private
     */
    _bindCloseLayerEvent: function() {
        var layer = ne.util.bind(function(e) {
            if (!$.contains(this._$calendarElement[0], e.target)) {
                $(document).off('click', layer);
                this._onKeydownPicker(true);
                this.close();
            }
        }, this);
        $(document).on('click', layer);
    },
    /**
     * 데이트 객체를 만들어서 리턴한다.
     *
     * @param {Object} datehash
     * @returns {Date}
     * @private
     */
    _getDateObject: function(datehash) {
        if (!datehash) {
            return;
        }
        var date = new Date(datehash.year, datehash.month - 1, datehash.date, 0, 0, 0);
        return date;
    },
    /**
     * 달력의 위치를 조정하고, 달력을 펼친다.
     *
     */
    open: function() {
        // 달력을 물고있는 활성화된 picker가 있으면 닫는다.
        if (this.constructor.enabledPicker) {
            this.constructor.enabledPicker.close();
        }

        var date = this.getDate();
        this._arrangeLayer();
        this._bindToCalendar();

        // 선택영역 제한이 있는지 확인후 선택불가능한 부분을 설정한다.
        if (this._isRestrict) {
            this._bindDrawEventForSelectableRange();
        }

        // 달력 레이어를 뺀 위치에서 마우스 클릭시 달력닫힘
        this._bindCloseLayerEvent();
        // 달력 커스텀이벤트
        this._bindCalendarCustomEvent();

        this._calendar.draw(date.year, date.month, false);
        this._$calendarElement.show();

        this.constructor.enabledPicker = this;
    },
    /**
     * 달력에 걸린 이벤트를 해지하고
     * 달력 레이어를 닫는다.
     */
    close: function() {
        this._unbindClick();
        this._unbindCalendarEvent();
        this._$calendarElement.hide();
    },
    /**
     * 캘린더를 해당 레이어 아래로 이동시킨다.
     *
     * @private
     */
    _arrangeLayer: function() {

        var element = this._$calendarElement,
            bound = this._getBoundingClientRect();

        element.css({
            position: 'absolute',
            left: bound.left + 'px',
            top: bound.bottom + 'px'
        });

    },
    /**
     * 앨리먼트의 BoundingClientRect를 구한다.
     * @param {HTMLElement} element
     * @returns {Object}
     * @private
     */
    _getBoundingClientRect: function(element) {
        element = element || this._element;

        var bound = element.getBoundingClientRect(),
            ceil = Math.ceil;

        bound = {
            left: ceil(bound.left),
            top: ceil(bound.top),
            bottom: ceil(bound.bottom),
            right: ceil(bound.right)
        };

        return bound;
    },
    /**
     * 캘린더가 변경될 때마다 데이터를 갱신하는 이벤트를 검.
     *
     * @private
     */
    _bindToCalendar: function() {
        this._calendar.on('afterDraw', ne.util.bind(function(data) {
            this.setDate(data.year, data.month, data.date);
        }, this));
    },
    /**
     * 앨리먼트에 데이터를 입력한다.
     *
     * @param {Object} date
     */
    insertDate: function(date) {
        this._element.value = this._formed(date);
        this.close();
    },
    /**
     * 현재 날짜해시를 받아온다.
     *
     * @returns {Object}
     */
    getDate: function() {
        return this._date;
    },
    /**
     * 데이터 저장
     * @param {String} year 연도
     * @param {String} month 월
     * @param {String} date 날짜
     */
    setDate: function(year, month, date) {
        this._date = this._date || {};
        this._date.year = year || this._date.year;
        this._date.month = month || this._date.month;
        this._date.date = date || this._date.date;
    },
    /**
     * 날짜 폼을 변경한다.
     * @param {String} form
     */
    setForm: function(form) {
        this._dateForm = form || this._dateForm;
    },
    /**
     * 달력에 이벤트를 붙인다.
     * @private
     */
    _bindClick: function() {
        if (!ne.util.isFunction(this._binder)) {
            this._binder = ne.util.bind(this._onClickCalendar, this);
        }
        var $week = this._$calendarElement;
        if (this._isRestrict) {
            $week.find('.' + this._selectableClass).on('click', this._binder);
        } else {
            $week.on('click', this._binder);
        }
    },
    /**
     * 달력 이벤트를 제거한다
     * @private
     */
    _unbindClick: function() {
        var $week = this._$calendarElement;
        if (this._isRestrict) {
            $week.find('.' + this._selectableClass).off('click');
        } else {
            $week.off('click');
        }
    },
    /**
     * 피커 이벤트 핸들러.
     * @private
     */
    _onClickPicker: function(e) {
        e.stopPropagation();
        this.open();
    },
    /**
     * 인풋 상자에서 엔터를 쳤을 경우 이벤트 처리
     * @private
     */
    _onKeydownPicker: function(e) {
        if (e !== true && e.keyCode !== 13) {
            return;
        }
        var value = this._element.value,
            date;

        if (this._isReadOnly || e === true) {
            date = this.getDate();
            this.insertDate(date);
        } else {
            date = this._checkValidDate(value);
            if (date) {
                this.setDate(date.year, date.month, date.date);
                this.insertDate(date);
            }
        }
    },
    /**
     * 유효한 날짜 폼인지 확인한다.
     * @param {(Number|String)} value
     * @returns {Object}
     * @private
     */
    _checkValidDate: function(value) {

        var reg = /^([19|20])*\d{2}([-|\/])*(0[1-9]|1[012])([-|\/])*(0[1-9]|[12][0-9]|3[0-1])$/,
            date;

        if (reg.test(value)) {
            date = this._extractDate(value);
            if (!this._checkRestrict(date)) {
                return date;
            }
        }
    },
    /**
     * 클릭시 발생한 이벤트
     * @param {Event} e
     * @private
     */
    _onClickCalendar: function(e) {
        e.stopPropagation();
        var target = e.target,
            value = (target.innerText || target.textContent || target.nodeValue),
            insertValue;
        if (!isNaN(Number(value))) {
            this.setDate(null, null, value);
            this._calendar.off('draw');

            insertValue = this.getDate();
            this.insertDate(insertValue);

        }
    },
    /**
     * 날짜 해쉬를 받아 양식에 맞춘 값을 생성해 돌려준다.
     *
     * @param {Object} hash 날짜 해시 값
     * @return {String} 폼에 맞춘 날짜 스트링
     * @private
     */
    _formed: function(hash) {
        hash = hash || this._date;
        var year = hash.year,
            month = hash.month,
            date = hash.date;

        month = month < 10 ? ('0' + Number(month)) : month;
        date = date < 10 ? ('0' + Number(date)) : date;

        var form = this._dateForm,
        replaceMap = {
            yyyy: year,
            yy: ((year).toString()).substr(2, 2),
            mm: month,
            m: Number(month),
            dd: date,
            d: Number(date)
        };
        form = form.replace(/yyyy|yy|mm|m|dd|d/g, function callback(key) {
            return replaceMap[key] || '';
        });
        return form;
    },
    /**
     * 데이터를 돌려준다.
     * @param {String} str 사용자가 입력한 텍스트
     * @returns {Object}
     * @private
     */
    _extractDate: function(str) {
        var temp,
            len;
        str = str.replace(/[-|\/]/g, '');
        temp = str.split('');
        len = str.length;
        temp = ne.util.map(temp, function(el, idx) {
            if (idx % 2) {
                if (idx === 1 && len > 7) {
                    return el;
                }
                return el + '-';
            } else {
                return el;
            }
        });
        // 기본세팅에 맞춰 6자리 날짜입력시, 연도 자릿수를 4자리로 맞춰준다.
        if (len < 7) {
            temp[0] = this._defaultCentury + temp[0];
        }

        str = temp.join('');
        temp = str.split('-');
        return { year: temp[0], month: temp[1], date: temp[2] };
    },
    /**
     * 선택 불가능한 날짜인지 확인한다.
     * @param {Object} datehash 비교할 날짜데이터
     * @returns {boolean}
     * @private
     */
    _checkRestrict: function(datehash) {

        var start = this._startEdge,
            end = this._endEdge,
            date = this._getDateObject(datehash);

        return date < start || date > end;
    },
    /**
     * 선택 가능한 영역에 클래스를 입힌다.
     * @private
     */
    _bindDrawEventForSelectableRange: function() {
        this._calendar.on('draw', ne.util.bind(function(data) {
            if (!this._checkRestrict(data)) {
                data.$dateContainer.addClass(this._selectableClass);
            }
        }, this));
    },
    /**
     * 달력이 갱신될때 이벤트를 건다.
     * @private
     */
    _bindCalendarCustomEvent: function() {
        this._calendar.on('beforeDraw', ne.util.bind(function() {
            this._unbindClick();
        }, this));
        this._calendar.on('afterDraw', ne.util.bind(function() {
            this._bindClick();
        }, this));
    },
    /**
     * 달력이 닫힐때 이벤트 제거
     * @private
     */
    _unbindCalendarEvent: function() {
        this._calendar.off();
    }
});
