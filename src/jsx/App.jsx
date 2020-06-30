import React, {Component} from 'react';
import style from './../styles/styles.less';

// https://github.com/topojson/topojson
import * as topojson from 'topojson';

// https://d3js.org/
import * as d3 from 'd3';

let interval, g, path;
const projection = d3.geoAzimuthalEquidistant().center([29,57]).scale(900);

const europeanUnion = {"Belgium": { "enter_year":1958, "enter_month":"January", "exit_year":9999, "exit_month":0},"France": { "enter_year":1958, "enter_month":"January", "exit_year":9999, "exit_month":0},"Germany": { "enter_year":1958, "enter_month":"January", "exit_year":9999, "exit_month":0},"Italy": { "enter_year":1958, "enter_month":"January", "exit_year":9999, "exit_month":0},"Luxembourg": { "enter_year":1958, "enter_month":"January", "exit_year":9999, "exit_month":0},"Netherlands": { "enter_year":1958, "enter_month":"January", "exit_year":9999, "exit_month":0},"Denmark": { "enter_year":1973, "enter_month":"January", "exit_year":9999, "exit_month":0},"Ireland": { "enter_year":1973, "enter_month":"January", "exit_year":9999, "exit_month":0},"United Kingdom": { "enter_year":1973, "enter_month":"January", "exit_year":2020, "exit_month":"January"},"Greece": { "enter_year":1981, "enter_month":"January", "exit_year":9999, "exit_month":0},"Portugal": { "enter_year":1986, "enter_month":"January", "exit_year":9999, "exit_month":0},"Spain": { "enter_year":1986, "enter_month":"January", "exit_year":9999, "exit_month":0},"Austria": { "enter_year":1995, "enter_month":"January", "exit_year":9999, "exit_month":0},"Finland": { "enter_year":1995, "enter_month":"January", "exit_year":9999, "exit_month":0},"Sweden": { "enter_year":1995, "enter_month":"January", "exit_year":9999, "exit_month":0},"Cyprus": { "enter_year":2004, "enter_month":"January", "exit_year":9999, "exit_month":0},"Czechia": { "enter_year":2004, "enter_month":"January", "exit_year":9999, "exit_month":0},"Estonia": { "enter_year":2004, "enter_month":"January", "exit_year":9999, "exit_month":0},"Hungary": { "enter_year":2004, "enter_month":"January", "exit_year":9999, "exit_month":0},"Latvia": { "enter_year":2004, "enter_month":"January", "exit_year":9999, "exit_month":0},"Lithuania": { "enter_year":2004, "enter_month":"January", "exit_year":9999, "exit_month":0},"Malta": { "enter_year":2004, "enter_month":"January", "exit_year":9999, "exit_month":0},"Poland": { "enter_year":2004, "enter_month":"January", "exit_year":9999, "exit_month":0},"Slovakia": { "enter_year":2004, "enter_month":"January", "exit_year":9999, "exit_month":0},"Slovenia": { "enter_year":2004, "enter_month":"January", "exit_year":9999, "exit_month":0},"Bulgaria": { "enter_year":2007, "enter_month":"January", "exit_year":9999, "exit_month":0},"Romania": { "enter_year":2007, "enter_month":"January", "exit_year":9999, "exit_month":0},"Croatia": { "enter_year":2013, "enter_month":"January", "exit_year":9999, "exit_month":0}};

class App extends Component {
  constructor(props) {
    super(props);

    this.appRef = React.createRef();

    this.state = {
      data:false,
      period_idx:0
    }
  }
  componentDidMount() {
    this.drawMap();
  }
  componentDidUpdate(prevProps, prevState, snapshot) {

  }
  componentWillUnMount() {
    clearInterval(interval);
  }
  drawMap() {
    let width = 720;
    let height = 720;
    
    let svg = d3.select('.' + style.map_container).append('svg').attr('width', width).attr('height', height);
    path = d3.geoPath().projection(projection);
    g = svg.append('g');

    let tooltip = d3.select('.' + style.map_container)
      .append('div')
      .attr('class', style.hidden + ' ' + style.tooltip);
    d3.json('./data/europe.topojson').then((topology) => {
      g.selectAll('path').data(topojson.feature(topology, topology.objects.europe).features)
        .enter()
        .append('path')
        .attr('d', path)
        .attr('class', style.path)
        .attr('fill', (d, i) => {
          return '#f9f9f9';
        });
      this.loadData();
    });
  }
  loadData() {
    // http://learnjsdata.com/read_data.html
    d3.csv('./data/data - data.csv').then((data) => {
      let data_from_1990 = data.slice(-62);
      this.setState((state, props) => ({
        data:data_from_1990,
        months:data_from_1990[this.state.period_idx].Months,
        current_country:data_from_1990[this.state.period_idx].Holder,
        year:parseInt(data_from_1990[this.state.period_idx].Year)
      }), this.changeCountryAttributes);
      this.appRef.current.style.display = 'block';
      setTimeout(() => {
        this.createInterval();
      }, 2000);
    });
  }
  createInterval() {
    this.changeCountryAttributes();
    interval = setInterval(() => {
      this.setState((state, props) => ({
        months:this.state.data[this.state.period_idx + 1].Months,
        period_idx:this.state.period_idx + 1,
        current_country:this.state.data[this.state.period_idx + 1].Holder,
        year:parseInt(this.state.data[this.state.period_idx + 1].Year)
      }), this.changeCountryAttributes);

      if (this.state.period_idx >= (this.state.data.length - 1)) {
        clearInterval(interval);
        setTimeout(() => {
          this.setState((state, props) => ({
            current_country:this.state.data[0].Holder,
            months:this.state.data[0].Months,
            period_idx:0,
            year:parseInt(this.state.data[0].Year)
          }), this.createInterval);
        }, 2000);
      }
    }, 1000);
  }
  changeCountryAttributes() {
    // Change fill color.
    g.selectAll('path')
      .attr('fill', (d, i) => {
        return this.getCountryColor(d.properties.NAME);
      });
  }
  getCountryColor(country) {
    if (europeanUnion[country]) {
      // Check if selected.
      if (country === this.state.current_country) {
        return '#164194';
      }
      // If entered current year.
      else if (europeanUnion[country].enter_year === this.state.year && (europeanUnion[country].enter_month === 'January' || europeanUnion[country].enter_month === this.state.months.split('–')[0])) {
        return '#ffd617';
      }
      // If exited current year.
      else if (europeanUnion[country].exit_year === this.state.year && (europeanUnion[country].exit_month === 'January' || europeanUnion[country].exit_month === this.state.months.split('–')[0])) {
        return '#f9f9f9';
      }
      // If entered before.
      else if (europeanUnion[country].enter_year < this.state.year) {
        return '#ffd617';
      }
      // If exited before.
      else if (europeanUnion[country].exit_year > this.state.year) {
        return '#f9f9f9';
      }
      else {
        return '#f9f9f9';
      }
    }
    else {
      return '#f9f9f9';
    }
  }
  // shouldComponentUpdate(nextProps, nextState) {}
  // static getDerivedStateFromProps(props, state) {}
  // getSnapshotBeforeUpdate(prevProps, prevState) {}
  // static getDerivedStateFromError(error) {}
  // componentDidCatch() {}
  render() {
    return (
      <div className={style.app} ref={this.appRef}>
        <div className={style.meta_container}>
          <div className={style.country_name}><h3>{this.state.current_country}</h3></div>
          <div className={style.year_month}><h3>{this.state.year} {this.state.months}</h3></div>
        </div>
        <div className={style.map_container}></div>
      </div>
    );
  }
}
export default App;