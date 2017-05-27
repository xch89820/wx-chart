(function(){
    // 生成数据
    var dataGenerator = function(labels, keys , min, max){
        keys = keys || ['value'];
        min = min || 10;
        max = max || 50;
        return labels.map(label => {
            let d = {
                label: label
            };
            keys.map(key => {
                d[key] = Math.floor(Math.random() * (max - min + 1) + min);
            });
            return d;
        });
    };

    var labels = ['一月', '二月', '三月', '四月', '五月', '六月', '七月'];
    var canvasWidth = 600;
    var canvasHeight = 400;
    var percentageFormatLabel = function (label, value, totalValue) {
        return label + ' (' + (value / totalValue * 100).toFixed(2) + '%)';
    };
    // 线状图
    var multiFillLine = function() {
        var wxLiner = new WxChart.WxLiner('multiFillLine', {
            width: canvasWidth,
            height: canvasHeight,
            title: '销售额',
            yScaleOptions: {
                position: 'left',
                title: '万元'
            },
            crossScaleOptions: {
                xFirstPointSpace: 0
            },
            legends: [{
                text: '日用品',
                key: 'dailyNecessities',
                fillArea: true,
                fillStyle: '#3385ff',
                strokeStyle: '#3385ff'
            }, {
                text: '水果',
                key: 'fruit',
                fillArea: true,
                fillStyle: '#238456',
                strokeStyle: '#238456'
            }, {
                text: '家电',
                key: 'appliances',
                fillStyle: '#842c05',
                strokeStyle: '#842c05'
            }]
        });

        wxLiner.update(dataGenerator(labels, ['dailyNecessities', 'fruit', 'appliances']));
    };
    // 饼图
    var basePie = function() {
        var wxPie = new WxChart.WxDoughnut('basePie', {
            width: canvasWidth,
            height: canvasHeight,
            title: '销售量',
            cutoutPercentage: 0
        });

        var datas = dataGenerator(labels);
        datas.forEach(function(x) {
            x.format = percentageFormatLabel;
        });
        wxPie.update(datas);
    };
    // 多纳圈图
    var baseDoughnut = function() {
        var wxPie = new WxChart.WxDoughnut('baseDoughnut', {
            width: canvasWidth,
            height: canvasHeight,
            title: '销售量'
        });

        var datas = dataGenerator(labels);
        datas.forEach(function(x) {
            x.format = percentageFormatLabel;
        });
        wxPie.update(datas);
    };

    var multiBar = function() {
        let wxBar = new WxChart.WxBar('multiBar', {
            width: canvasWidth,
            height: canvasHeight,
            title: '销售量',
            yScaleOptions: {
                position: 'left',
                title: '万元'
            },
            legends: [{
                text: '日用品',
                key: 'dailyNecessities',
                fillStyle: '#3385ff',
                strokeStyle: '#3385ff'
            }, {
                text: '水果',
                key: 'fruit',
                fillStyle: '#238456',
                strokeStyle: '#238456'
            }, {
                text: '家电',
                key: 'appliances',
                fillStyle: '#94332f',
                strokeStyle: '#94332f'
            }]
        });

        wxBar.update(dataGenerator(labels, ['dailyNecessities', 'fruit', 'appliances']));
    };

    var multiStackedBar = function() {
        let wxBar = new WxChart.WxBar('multiStackedBar', {
            width: canvasWidth,
            height: canvasHeight,
            title: '销售量',
            stacked: true,
            yScaleOptions: {
                position: 'left',
                title: '万元'
            },
            legends: [{
                text: '日用品',
                key: 'dailyNecessities',
                fillStyle: '#3385ff',
                strokeStyle: '#3385ff'
            }, {
                text: '水果',
                key: 'fruit',
                fillStyle: '#238456',
                strokeStyle: '#238456'
            }, {
                text: '家电',
                key: 'appliances',
                fillStyle: '#94332f',
                strokeStyle: '#94332f'
            }]
        });

        wxBar.update(dataGenerator(labels, ['dailyNecessities', 'fruit', 'appliances'], -20, 100));
    }

    window.onload = function() {
        multiFillLine();
        basePie();

        baseDoughnut();
        multiBar();
        multiStackedBar();
    };

})();