import React, {Component} from 'react';
import style from './../styles/styles.less';

// https://github.com/topojson/topojson
import * as topojson from 'topojson';

// https://d3js.org/
import * as d3 from 'd3';

let interval, g, path;
const projection = d3.geoAzimuthalEquidistant().center([29,57]).scale(900);

class App extends Component {
  constructor(props) {
    super(props);

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
          return this.getCountryColor(d.properties.NAME);
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
        year:data_from_1990[this.state.period_idx].Year
      }), this.changeCountryAttributes);
      setTimeout(() => {
        this.createInterval();
      }, 2000);
    });
  }
  createInterval() {
    interval = setInterval(() => {
      this.setState((state, props) => ({
        months:this.state.data[this.state.period_idx + 1].Months,
        period_idx:this.state.period_idx + 1,
        current_country:this.state.data[this.state.period_idx + 1].Holder,
        year:this.state.data[this.state.period_idx + 1].Year
      }), this.changeCountryAttributes);

      if (this.state.period_idx >= (this.state.data.length - 1)) {
        clearInterval(interval);
        setTimeout(() => {
          this.setState((state, props) => ({
            current_country:this.state.data[0].Holder,
            months:this.state.data[0].Months,
            period_idx:0,
            year:this.state.data[0].Year
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
    if (country === this.state.current_country) {
      return '#164194';
    }
    else {
      return '#e5e5e5';
    }
  }
  // shouldComponentUpdate(nextProps, nextState) {}
  // static getDerivedStateFromProps(props, state) {}
  // getSnapshotBeforeUpdate(prevProps, prevState) {}
  // static getDerivedStateFromError(error) {}
  // componentDidCatch() {}
  render() {
    return (
      <div className={style.app}>
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