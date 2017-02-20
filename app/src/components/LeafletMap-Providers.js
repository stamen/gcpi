import React, { Component, PropTypes } from 'react';
import L from 'leaflet';
import config from '../config';

// Bing tileLayer
L.TileLayer.Bing = L.TileLayer.extend({
 getTileUrl: function (tilePoint) {
    return L.Util.template(this._url, {
      s: Math.floor( Math.random() * 3 ),
      q: this._quadKey(tilePoint.x, tilePoint.y, this._getZoomForUrl())
    });
 },
 _quadKey: function (x, y, z) {
   let quadKey = [];
   for (let i = z; i > 0; i--) {
    let digit = '0';
    let mask = 1 << (i - 1);
    if ((x & mask) !== 0) {
      digit++;
    }
    if ((y & mask) !== 0) {
      digit++;
      digit++;
    }

    quadKey.push(digit);
   }

   return quadKey.join('');
 }
 });

L.tileLayer.bing = function(url, options) {
    return new L.TileLayer.Bing(url, options);
}


class LeafletMapProviders extends Component {

  static propTypes = {
    leafletMap: PropTypes.object
  }

  static defaultProps = {
    leafletMap: null
  }

  constructor(props) {
    super(props);

    this.state = {
      selected: 'osm',
      custom: null,
      init: false,
      open: false
    };

    this.onChangeHandler = this.onChangeHandler.bind(this);
    this.onCustomClick = this.onCustomClick.bind(this);
    this.toggleMenu = this.toggleMenu.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    const {init} = this.state;

    if (nextProps.leafletMap && !init) {
      this.setProvider(nextProps.leafletMap, this.state.selected);
      this.setState({init: true});
    }
  }

  componentDidMount() {
    this.setProvider(this.props.leafletMap, this.state.selected);
  }

  toggleMenu() {
    const {open} = this.state;
    this.setState({
      open: !open
    });
  }

  onChangeHandler(evt) {
    const {selected, custom} = this.state;

    if (selected !== evt.target.value) {
      this.setProvider(this.props.leafletMap, evt.target.value, custom);
      this.setState({
        selected: evt.target.value
      });
    }
  }

  onCustomClick(evt) {
    const {custom} = this.state;
    const {leafletMap} = this.props;

    // http://a.tile.stamen.com/watercolor/{z}/{x}/{y}.jpg
    var parent = evt.target.parentNode;
    var provider = parent.querySelector('input').value.trim();

    // TODO: validate provider template ?
    if (custom !== provider) {
      this.setProvider(leafletMap, 'custom', provider);

      this.setState({
        custom: provider
      });
    }

  }

  setProvider(map, provider, custom = null) {
    if (!map) return;

    if (provider === 'custom' && custom) {
      L.tileLayer(custom, {
          attribution: '',
          maxZoom: 19
      }).addTo(map);

      return;
    }

    let definition = config.map_providers.find(p => p.id === provider);

    if (definition) {
      if (definition.useBing) {
        L.tileLayer.bing(definition.url, {
            attribution: definition.attribute,
            maxZoom: definition.maxZoom
        }).addTo(map);
      } else {
        L.tileLayer(definition.url, {
            attribution: definition.attribute,
            maxZoom: definition.maxZoom
        }).addTo(map);
      }
    }

  }

  renderProviders() {
    const {selected} = this.state;

    return config.map_providers.map(p => {
      let labelKlass = selected === p.id ? 'selected' : '';

      return (
        <li key={`provider_${p.id}`} className={labelKlass}>
          <label>
            <input className='input' type='radio' value={p.id} checked={selected === p.id} onChange={this.onChangeHandler}/>
            <span>{p.label}</span>
          </label>
        </li>
      );
    });
  }

  render() {
    const {leafletMap} = this.props;
    if (!leafletMap) return null;

    const {selected, open} = this.state;

    const klass = open ? 'leaflet-map-providers open' : 'leaflet-map-providers';
    return (
      <div className={klass}>
        <h4 onClick={this.toggleMenu}><span className='icon providers'></span>Map Provider</h4>
        {open &&
          <ul className='list-reset'>
            {this.renderProviders()}
            <li className={selected === 'custom' ? 'selected' : ''}>
              <label>
                <input className='input custom-provider' type='radio' value='custom' checked={selected === 'custom'} onChange={this.onChangeHandler}/>
                <span>Custom</span>
                <div>
                  <p>{config.custom_description}</p>
                  <input className='input' type='text' placeholder={config.custom_placeholder}/>
                  <button className='btn' onClick={this.onCustomClick}>Apply</button>
                </div>
              </label>
            </li>
          </ul>
        }
      </div>
    );
  }
}

export default LeafletMapProviders;