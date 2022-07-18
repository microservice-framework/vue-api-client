# vue-api-client
Vue.$api that is capable to be watched and provide wrapper to access MFW API


# usage

```
import APICLient from "@microservice-framework/vue-api-client";

// Init global this.$state variable
Vue.use(APICLient, {
  apiURL: "https://api.myserver.com",
  methods: [
    {
      name: "printSelf",
      function: function () {
        console.log(this);
      },
    }
  ]
});

....


this.$api.setAccessToken({
        accessToken: "APIAccessToken",
        expireAt: -1,
      });

...

watch: {
  '$api.online': function(newValue) {
    if(newValue) {
      //fetch data from API
    }
  }
}
```
