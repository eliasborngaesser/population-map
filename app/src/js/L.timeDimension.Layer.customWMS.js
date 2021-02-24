L.TimeDimension.Layer.customWMS = L.TimeDimension.Layer.WMS.extend({
      _createLayerForTime:function(time){
        //Added Code
        this._dynamicStyles=document.getElementById("dynamicStyles").checked
        if (activeLayer && this._dynamicStyles)
            {
            _timeIndex=this._availableTimes.indexOf(time)
            _currentValues=legendMapping.get(activeLayer+_timeIndex).values;
        }
        else{
            _currentValues=legendMapping.get(activeLayer).values
        }
        var _currentValuesWithName=""
        for (var i = 0; i < _currentValues.length; i++) {
            _currentValuesWithName+="value_"+i+":"+_currentValues[i]+";"
        }
        var wmsParams = this._baseLayer.options;
        wmsParams.styles=this._baseLayer.options.layers
        wmsParams.env=_currentValuesWithName
        wmsParams.time = new Date(time).toISOString();
        return new this._baseLayer.constructor(this._baseLayer.getURL(), wmsParams);
    },

    _getLayerForTime: function(time) {
        if (time == 0 || time == this._defaultTime || time == null) {
            return this._baseLayer;
        }
        if (this._layers.hasOwnProperty(time) && this._dynamicStyles==document.getElementById("dynamicStyles").checked) {
            return this._layers[time];
        }
        var nearestTime = this._getNearestTime(time);
        if (this._layers.hasOwnProperty(nearestTime) && this._dynamicStyles==document.getElementById("dynamicStyles").checked) {
            return this._layers[nearestTime];
        }

        var newLayer = this._createLayerForTime(nearestTime);

        this._layers[time] = newLayer;

        newLayer.on('load', (function(layer, time) {
            layer.setLoaded(true);
            // this time entry should exists inside _layers
            // but it might be deleted by cache management
            if (!this._layers[time]) {
                this._layers[time] = layer;
            }
            if (this._timeDimension && time == this._timeDimension.getCurrentTime() && !this._timeDimension.isLoading()) {
                this._showLayer(layer, time);
            }
            // console.log('Loaded layer ' + layer.wmsParams.layers + ' with time: ' + new Date(time).toISOString());
            this.fire('timeload', {
                time: time
            });
        }).bind(this, newLayer, time));

        // Hack to hide the layer when added to the map.
        // It will be shown when timeload event is fired from the map (after all layers are loaded)
        newLayer.onAdd = (function(map) {
            Object.getPrototypeOf(this).onAdd.call(this, map);
            this.hide();
        }).bind(newLayer);
        return newLayer;
    },
});



    L.timeDimension.layer.customWMS = function (layer, options) {
        this.layerName
        return new L.TimeDimension.Layer.customWMS(layer, options);  
      };
      