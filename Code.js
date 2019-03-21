/**
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*
 * The GitHub OAuth2 client ID and secret. Uncomment and paste values from the
 * GitHub developer settings.
 * Note: A better way to store these credentials is through the PropertiesService!
 * See https://developers.google.com/apps-script/guides/properties
 */
 
  //TO DO: Initialize CLIENT_ID and CLIENT_SECRET from GAS properties

/**
 * Handles GET requests. The page structure is described in the Page.html
 * project file.
 */
function doGet() {
  //Grab service object, which tells us login status
  var service = getGitHubService();
  var template = HtmlService.createTemplateFromFile('Page');
  template.email = Session.getEffectiveUser().getEmail(); //browser email of user
  template.isSignedIn = service.hasAccess(); //login status based on service object
  template.gitUserName = 'none'; //
  
  return template.evaluate()
      .setTitle('GitHub OAuth 2 Example')
      .setSandboxMode(HtmlService.SandboxMode.IFRAME);
}

/**
 * Builds and returns the authorization URL from the service object.
 * @return {String} The authorization URL.
 */
function getAuthorizationUrl() {
  return getGitHubService().getAuthorizationUrl();
}

/**
 * Resets the API service, forcing re-authorization before
 * additional authorization-required API calls can be made.
 */
function signOut() {
  getGitHubService().reset();
}

/**
 * Gets the user's GitHub profile.
 */
function getGitHubProfile() {
  return getGitHubResource('user');
}

/**
 * Gets the user's GitHub repos.
 */
function getGitHubRepos() {
  return getGitHubResource('user/repos');
}

/**
 * Fetches the specified resource from the GitHub API.
 */
function getGitHubResource(resource) {
  var service = getGitHubService();
  if (!service.hasAccess()) {
    throw new Error('Error: Missing GitHub authorization.');
  }
  var url = 'https://api.github.com/' + resource;
  var response = UrlFetchApp.fetch(url, {
    headers: {
      Authorization: 'Bearer ' + service.getAccessToken()
    }
  });
  return JSON.parse(response.getContentText());
}

/**
 * Gets an OAuth2 service configured for the GitHub API.
 * @return {OAuth2.Service} The OAuth2 service
 */
function getGitHubService() {
  /* TO DO: Fill in */
  
}

/**
 * Callback handler that is executed after an authorization attempt.
 * @param {Object} request The results of API auth request.
 */
function authCallback(request) {
  var template = HtmlService.createTemplateFromFile('Page');
  template.email = Session.getEffectiveUser().getEmail();
  template.gitUserName = 'none';
  template.isSignedIn = false;
  template.error = null;
  var title;
  try {
    var service = getGitHubService();
    var authorized = service.handleCallback(request);
    template.isSignedIn = authorized;
    template.gitUserName = getGitHubProfile().login;
    title = authorized ? 'Welcome!' : 'Access Denied';
  } catch (e) {
    template.error = e;
    title = 'Access Error';
  }
  template.title = title;
  return template.evaluate()
      .setTitle(title)
      .setSandboxMode(HtmlService.SandboxMode.IFRAME);
}

/**
 * Logs the redict URI to register in the Google Developers Console.
 */
function logRedirectUri() {
  Logger.log(OAuth2.getRedirectUri());
}

/**
 * Includes the given project HTML file in the current HTML project file.
 * Also used to include JavaScript.
 * @param {String} filename Project file name.
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}
