import axios from "axios";

const baseurl = "http://192.168.0.210:8088"

export function listBranches() {
  return new Promise((resolve, reject) => {
    axios.get(baseurl + "/gomss/branches").then(function (response) {
      resolve(response.data);
    })
    .catch(function (error) {
      reject(error.response);
    });
  });
   
}

export function listZrtcs() {
  return new Promise((resolve, reject) => {
    axios.get(baseurl + "/zrtc/path").then(function (response) {
      resolve(response.data);
    })
    .catch(function (error) {
      reject(error.response);
    });
  });
    
}

export function listPublishRecords(successFn, failedFn) {
    axios.get(baseurl + "/publish/records").then(function (response) {
        successFn(response.data);
      })
      .catch(function (error) {
        failedFn(error.response);
      });
}

export function getPublishLogs(successFn, failedFn) {
    axios.get(baseurl + "/publish/logs").then(function (response) {
        successFn(response.data);
      })
      .catch(function (error) {
        failedFn(error.response);
      });
}

export function publish(data, successFn, failedFn) {
    axios.post(baseurl + "/publish", data).then(function (response) {
        successFn(response.data);
      })
      .catch(function (error) {
        failedFn(error.response);
      });
}