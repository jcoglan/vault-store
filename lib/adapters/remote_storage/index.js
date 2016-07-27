'use strict';

var authorize = require('./authorize'),
    errors    = require('../errors'),
    request   = require('../../util/request');

var RemoteStorageAdapter = function(session) {
  this._session = session;
  this._rootUrl = session.webfinger.storageRoot.replace(/\/?$/, '/') + session.scope;
  this._token   = session.authorization.access_token;
};

RemoteStorageAdapter.prototype.read = function(name) {
  var url  = this._rootUrl + '/' + name,
      head = {Authorization: 'Bearer ' + this._token};

  return request('GET', url, {}, head).then(function(response) {
    var status = response.statusCode,
        body   = response.body.toString();

    if (status >= 200 && status < 300) return body;

    if (status === 401 || status === 403)
      throw new errors.AuthError('RemoteStorage error: ' + body);

    if (status === 404) return null;

    throw new Error('RemoteStorage error (' + status + '): GET ' + url);
  });
};

RemoteStorageAdapter.prototype.write = function(name, data) {
  if (data === null) return this._delete(name);

  var url  = this._rootUrl + '/' + name,
      head = {Authorization: 'Bearer ' + this._token};

  head['Content-Type'] = 'text/plain';

  return request('PUT', url, data, head).then(function(response) {
    var status = response.statusCode,
        body   = response.body.toString();

    if (status >= 200 && status < 300) return;

    if (status === 401 || status === 403)
      throw new errors.AuthError('RemoteStorage error: ' + body);

    if (status === 409 || status === 412)
      throw new errors.ConflictError('RemoteStorage error: ' + body);

    throw new Error('Request failed (' + status + '): PUT ' + url);
  });
};

RemoteStorageAdapter.prototype._delete = function(name) {
  var url  = this._rootUrl + '/' + name,
      head = {Authorization: 'Bearer ' + this._token};

  return request('DELETE', url, {}, head).then(function(response) {
    var status = response.statusCode,
        body   = response.body.toString();

    if (status >= 200 && status < 300) return;

    if (status === 401 || status === 403)
      throw new errors.AuthError('RemoteStorage error: ' + body);

    if (status === 404) return;

    if (status === 409 || status === 412)
      throw new errors.ConflictError('RemoteStorage error: ' + body);

    throw new Error('RemoteStorage error (' + status + '): ' + body);
  });
};

RemoteStorageAdapter.authorize = authorize;

module.exports = RemoteStorageAdapter;