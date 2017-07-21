/**
 * by hecom at 2016/5/20
 */
(function(exports, storage) {
  'use strict';

  var table = {
    name: 'draft',

    getItem: function(sKey) {
      var jsonStr = storage.getItem(sKey), sObj;
      try {
        sObj = JSON.parse(jsonStr);
      } catch(e) {}
      return sObj;
    },

    setItem: function(sKey, sValue) {
      var jsonStr = JSON.stringify(sValue);
      return storage.setItem(sKey, jsonStr);
    },

    removeItem: function(sKey) {
      return storage.removeItem(sKey);
    }
  };

  var TYPES = 'visitRecord|subVisitRecord|phoneRecord|trainRecord|customer|contract'.split('|');

  exports.draftWork = {

    _oids: function() {
      return table.getItem('draft.oids') || [];
    },

    list: function() {
      var self = this;
      var aObjs = [], aIds = this._oids();
      aIds.forEach(function(oId) {
        var obj = self.get(oId);
        if (obj && typeof obj == 'object') {
          aObjs.push(obj);
        } else {
          self.remove(oId);
        }
      });
      return aObjs;
    },

    get: function(oid) {
      return table.getItem('draft.'+oid);
    },

    set: function(oid, row) {
      if (typeof row != 'object') {
        return false;
      }
      if (!row.type || TYPES.indexOf(row.type) === -1) {
        return false;
      }
      oid = parseInt(oid, 10);
      if (isNaN(oid)) {
        oid = ~~(Math.random()*1e7);
      }
      this.remove(oid);
      row._oid = oid;
      row.updated_at = Date.now();
      table.setItem('draft.'+oid, row);
      var aIds = this._oids();
      aIds.unshift(oid);
      table.setItem('draft.oids', aIds);
      return oid;
    },

    remove: function(oid) {
      oid = parseInt(oid, 10);
      if (isNaN(oid)) {
        return false;
      }
      table.removeItem('draft.'+oid);
      var aIds = this._oids(), oIndex = aIds.indexOf(oid);
      if (oIndex >= 0) {
        aIds.splice(oIndex, 1);
      }
      table.setItem('draft.oids', aIds);
      return true;
    },

    clear: function() {
      for (var sKey in storage) {
        if (/draft\.\d/.test(sKey)) {
          table.removeItem(sKey);
        }
      }
      table.removeItem('draft.oids');
    }
  }
})(window, window.localStorage);
