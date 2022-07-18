/*global MicroserviceClient*/

function getWatch() {
  return {
    "$api.client": function (newValue, oldValue) {
      if (newValue) {
        if (this.$api.online === false || oldValue == false) {
          this.$api.online = true;
        }
        return;
      }
      this.$api.online = false;
    },
    "$api.accessToken": function (newValue) {
      if (newValue && newValue != "") {
        return (this.$api.client = new MicroserviceClient({
          URL: this.$api.url,
          accessToken: newValue,
        }));
      }
      this.$api.client = false;
    },
    "$api.expireAt": function (newValue, oldValue) {
      if (newValue == 0) {
        this.$api.client = false;
        this.$api.accessToken = "";
        return;
      }
      if (newValue < oldValue) {
        return;
      }
      if (this.$api.timerApiClient) {
        clearTimeout(this.$api.timerApiClient);
      }
      var self = this;
      var period = newValue - Date.now();
      if (period > 0 && !isNaN(period)) {
        this.$api.timerApiClient = setTimeout(function () {
          self.$api.expireAt = 0;
          self.$api.accessToken = "";
        }, period);
      }
    },
  };
}

import { reactive } from "vue";

export default {
  install: (app, apiSettings) => {
    var api = {
      online: false,
      client: false,
      timerApiClient: false,
      url: apiSettings.apiURL,
      accessToken: "",
      expireAt: 0,
      setAccessToken: function (setValue) {
        this.accessToken = setValue.accessToken;
        this.expireAt = setValue.expireAt;
      },
      testAccessToken: function (AccessToken, callback) {
        var client = new MicroserviceClient({
          URL: apiSettings.apiURL,
          accessToken: AccessToken,
          headers: { scope: "auth" },
        });
        client.get("auth/" + AccessToken, function (err, handlerResponse) {
          console.log(err, handlerResponse);
          if (callback) {
            callback(err, handlerResponse);
          }
        });
      },
    };
    if (apiSettings.methods) {
      for (var i in apiSettings.methods) {
        var method = apiSettings.methods[i];
        if (
          typeof method.name !== "undefined" &&
          typeof method.function !== "undefined"
        ) {
          api[method.name] = method.function;
        }
      }
    }
    app._APIState = false;
    app.config.globalProperties["$api"] = reactive(api);
    app.mixin({
      created: function beforeCreate() {
        if (!app._APIState) {
          app._APIState = true;
          app.$api = this.$api;
          var watchers = getWatch();
          for (var name in watchers) {
            this.$watch(name, watchers[name]);
          }
        }
      },
    });
  },
};
