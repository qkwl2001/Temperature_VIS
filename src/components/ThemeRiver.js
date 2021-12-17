
import React from "react";
import * as d3 from "d3";



class ThemeRiver extends React.Component{
    componentDidMount(){
        // get main SVG and its attributes & setting hyper-parameters;
        const svg = d3.select('#mainsvg');
        const width = +svg.attr('width');
        const height = +svg.attr('height');

        const margin = {'top': 100, right: 120, bottom: 100, left: 120};
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;
        const xValue = (datum) => { return dates.indexOf(datum['日期']); };
        const yValue = (datum) => {return datum['新增确诊']};
        //const xValue = d => d['确诊人数'];
        //const xValue = d => d['感染率'];
        //const yValue = d => {return Math.log(d['diffuse_smooth'] + 1)};
        //const yValue = d => {return d['diffuse_smooth']};
        //const yValue = d => {return Math.log(d['newinfec']+1)};
        //const rValue = d => {return Math.sqrt(d['确诊人数']) + 6};
        let low_max = 4000;
        let up_max = 1000;
        let xScale, yScale, nyScale;
        let maxX, maxY;
        let dates;
        let aduration = 1000;
        let metapop;

        const xAxisLabel = ' ';
        const yAxisLabel = '新增人数';

        var province_color = {
            "广东": "#DD6B66",
            "河南": "#759AA0",
            "浙江": "#E69D87",
            "湖南": "#8DC1A9",
            "安徽": "#EA7E53",
            "江西": "#EEDD78",
            "江苏": "#73A373",
            "重庆": "#73B9BC",
            "山东": "#7289AB",
            "四川": "#91CA8C",
            "黑龙江": "#F49F42",
            "北京": "#AA312C",
            "上海": "#39656D",
            "福建": "#B35E45",
            "河北": "#4B8E6F",
            "陕西": "#B6481C",
            "广西": "#BBA838",
            "云南": "#386F38",
            "海南": "#388589",
            "贵州": "#385177",
            "山西": "#50964A",
            "辽宁": "#C16B0D",
            "天津": "#FF190F",
            "甘肃": "#45BFD3",
            "吉林": "#FF5F2F",
            "内蒙古":"#50F3A8",
            "新疆":"#FF4800",
            "宁夏":"#FFDE1A",
            "香港":"#41D541",
            "青海":"#32E7EF",
            "台湾":"#ef638e",
            "澳门":"#3B7CDE",
            "西藏":"#58FD4A",
            "湖北":"#FF8500"
        }


        const renderinit = function(data, seq){
            // Linear Scale: Data Space -> Screen Space;
            xScale = d3.scaleLinear()
                .domain([0, 22])
                .range([0, innerWidth]);

            // Introducing y-Scale;
            yScale = d3.scaleLinear()
                .domain([up_max, 0, -low_max]) // "extent" is equivalent to [d3.min(data, xValue), d3.max(data, xValue)];
                .range([innerHeight, innerHeight / 2, 0])
                .nice();

            nyScale = d3.scaleLinear()
                .domain([-up_max, 0, low_max])
                .range([innerHeight, innerHeight / 2, 0])
                .nice();

            // generate maxX and maxY;
            maxX = xScale(d3.max(data, xValue));
            maxY = yScale(d3.max(data, yValue));

            // The reason of using group is that nothing is rendered outside svg, so margin of svg is always blank while margin of group is rendered inside svg;
            const g = svg.append('g')
                .attr('transform', `translate(${margin.left}, ${margin.top})`)
                .attr('id', 'maingroup');

            svg.append('g')
                .attr('transform', `translate(${margin.left}, ${margin.top})`)
                .attr('id', 'hubeigroup');

            // Adding axes;
            var formatter = d3.format("0")
            const yAxis = d3.axisLeft(yScale)
                .tickSize(-innerWidth)
                .tickFormat(function (d) {
                    if (d === 0) return 0; // No label for '0'
                    else if (d < 0) d = -d; // No nagative labels
                    return formatter(d);
                })
                //.tickFormat(d3.format('.2s'))
                .tickPadding(10); // .tickPadding is used to prevend intersection of ticks;
            const xAxis = d3.axisBottom(xScale)
                //.tickFormat(d3.format('.2s'))
                .tickSize(-innerHeight)
                .tickPadding(10)
                .ticks(21);

            let yAxisGroup = g.append('g').call(yAxis).attr('id', 'yaxis')
            d3.selectAll('#yaxis .tick text').attr('transform', `translate(${0}, ${-3})`);
            yAxisGroup.append('text')
                .attr('transform', `rotate(-90)`)
                .attr('x', -innerHeight / 2)
                .attr('y', -80)
                .attr('fill', 'white')
                .text(yAxisLabel)
                .attr('text-anchor', 'middle') // Make label at the middle of axis.
            yAxisGroup.selectAll('.domain').remove(); // we can select multiple tags using comma to seperate them and we can use space to signify nesting;

            let xAxisGroup = g.append('g').call(xAxis).attr('transform', `translate(${0}, ${innerHeight})`).attr('id', 'xaxis');
            d3.selectAll('#xaxis .tick text').attr('transform', `translate(${0}, ${5})`);
            xAxisGroup.append('text')
                .attr('y', 60)
                .attr('x', innerWidth / 2)
                .attr('fill', 'white')
                .text(xAxisLabel);
            xAxisGroup.selectAll('.domain').remove();

            // console.log(document.getElementById('xaxis'));
            let myticks = ["1月21日", "1月22日", "1月23日", "1月24日", "1月25日", "1月26日",
                "1月27日", "1月28日", "1月29日", "1月30日", "1月31日", "2月1日", "2月2日",
                "2月3日", "2月4日", "2月5日", "2月6日", "2月7日", "2月8日", "2月9日", "2月10日",
                "2月11日", "2月12日"]
            for(let tid = 0; tid < myticks.length; tid++){
                document.getElementById('xaxis').getElementsByClassName('tick')[tid].getElementsByTagName('text')[0].textContent = myticks[tid];
            }
        };

        const render = function(data, keys, area){
            let g;
            if(keys.includes('湖北')){
                g = d3.select('#maingroup');
            }else{
                g = d3.select('#hubeigroup');
            }

            let layers = d3.stack()
                .keys(keys)
                .offset(d3.stackOffsetNone)
                //.order(d3.stackOrderDescending)
                .order(d3.stackOrderNone)
                (data);
            // console.log(layers);

            const path = g.selectAll("path")
                .data(layers)
                .enter().append("path")
                .attr("d", area)
                .attr("opacity",0.9)
                // fill attrbute requires designers to assign colors for each province;
                .attr("fill", function (d,i) {
                    return province_color[d["key"]]; });
        };
        const seqgen = function(data){
            // re-arrange the data sequentially;
            let prestack = [];
            dates.forEach(datum => {
                prestack.push({'日期': datum});
            });
            data.forEach(datum => {
                //sequential[alldates.indexOf(datum['日期'])].push(datum);
                prestack[dates.indexOf(datum['日期'])][datum['省份']] = yValue(datum);
            });
            return prestack
        }

        d3.csv('./data/province.csv').then(function(data){
            console.log(data);
            data.forEach(datum => {
                // pre-process the data;
                datum['确诊人数'] = +(datum['确诊人数']);
                datum['治愈人数'] = +(datum['治愈人数']);
                datum['死亡人数'] = +(datum['死亡人数']);
                datum['新增确诊'] = +(datum['新增确诊']);
            });

            // delete '总计';
            data = data.filter(datum => {return datum['省份'] !== '总计'});

            // remove duplicated items;
            let alldates = Array.from(new Set(data.map( datum => datum['日期'])));

            // make sure dates are listed according to real time order;
            alldates = alldates.sort(function(a,b){
                // turn your strings into dates, and then subtract them
                // to get a value that is either negative, positive, or zero.
                return new Date(b.date) - new Date(a.date);
            });
            dates = alldates;

            // generate sequential data;
            let sequential = [];
            alldates.forEach(datum => {
                sequential.push([]);
            });
            data.forEach(datum => {
                sequential[alldates.indexOf(datum['日期'])].push(datum);
            });
            // smooth new infec;
            let t = 0;
            const originyValue = datum => datum['新增确诊'];
            for(; t < sequential.length; t++){
                sequential[t].forEach(datum => {
                    if(t == 0){
                        datum.newinfec_s = originyValue(datum);
                    }else if(t == 1){
                        datum.newinfec_s = (
                            originyValue(datum) +
                            originyValue(sequential[t-1].find(x => x['省份'] === datum['省份']))
                        ) / 2.0;
                    }else{
                        datum.newinfec_s = (
                            originyValue(datum) +
                            originyValue(sequential[t-1].find(x => x['省份'] === datum['省份'])) +
                            originyValue(sequential[t-2].find(x => x['省份'] === datum['省份']))
                        ) / 3.0;
                    }
                })
            }
            console.log(data);

            // split data from Hu-Bei and not from Hu-Bei;
            let data_hubei = data.filter(datum => {return datum['省份'] === '湖北'});
            data = data.filter(datum => {return datum['省份'] !== '湖北'});

            // stack data;
            let prestack = seqgen(data);
            let prestack_hubei = seqgen(data_hubei);
            // let keys = Array.from(new Set(data.map( datum => datum['省份'])));
            // sort according to '累计确诊' and prepare keys;
            const sortedforkey = sequential[sequential.length-1].sort( (a,b) => b['确诊人数'] - a['确诊人数'] );
            let keys = sortedforkey.map(d => d['省份']);
            keys = keys.filter(d => {return d !== '湖北'});
            let keys_hubei = Array.from(new Set(data_hubei.map( datum => datum['省份'])));

            // generate low_max and up_max for Y-scale;
            up_max = d3.max(sequential, seq => {
                // console.log(seq);
                let result = 0;
                seq.forEach(s => {
                    if(s['省份'] !== '湖北'){
                        result += yValue(s);
                    }
                })
                return result;
            })
            low_max = d3.max(sequential, seq => {
                let result = 0;
                seq.forEach(s => {
                    if(s['省份'] === '湖北'){
                        result += yValue(s);
                    }
                })
                return result;
            })
            console.log(low_max, up_max)

            // initialize the chart;
            renderinit(data);

            const area = d3.area()
                .curve(d3.curveCardinal.tension(0.3)) // default is d3.curveLinear, d3.curveBundle.beta(1.0)
                .x(d => xScale(xValue(d.data)))
                .y0(d => yScale(d[0]))
                .y1(d => yScale(d[1]));

            const area_hubei = d3.area()
                .curve(d3.curveCardinal.tension(0.3))
                .x((d) => xScale(xValue(d.data)))
                .y0(d => nyScale(d[0]))
                .y1(d => nyScale(d[1]));

            // set the animation interval;
            render(prestack, keys, area);
            render(prestack_hubei, keys_hubei, area_hubei);
        });
    }

    render() {
        return (
        <div>
            <svg width="825" height="460" id="mainsvg" className="svgs" > </svg>

        </div>);
    }
}
export  default  ThemeRiver;