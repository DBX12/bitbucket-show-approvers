// ==UserScript==
// @name         Show commit approvers on bitbucket
// @namespace    http://dbx12.de/
// @version      0.6
// @description  Show commit approvers
// @author       dbx12
// @match        https://bitbucket.org/*/*/pull-requests/*
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js
// @run-at       document-end
// @grant        GM.xmlHttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @connect      bitbucket.org
// @updateURL    https://github.com/DBX12/bitbucket-show-approvers/raw/master/bitbucket-show-approvers.user.js
// @downloadURL  https://github.com/DBX12/bitbucket-show-approvers/raw/master/bitbucket-show-approvers.user.js
// ==/UserScript==

(function () {
    'use strict';

    let prId = 0;
    let project = "";
    let repositoryName = "";
    let commitData = {};

    let settings = {};
    let alreadyProcessedParticipants = {};

    let inhibitLoading = false;


    const API_BASE = "https://bitbucket.org/api/2.0/";

    let $ = window.jQuery;

    const COMMIT_TABLE_HEADLINE_SELECTOR = 'section[data-qa="commit-list-styles"] h2';
    const COMMIT_TABLE_SELECTOR = 'section[data-qa="commit-list-styles"] table';
    const LOAD_MORE_COMMITS_SELECTOR = 'button > span:contains("Load more commits")';
    const SVG_CHECKMARK_GREEN = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" style="scale:0.6;"><circle fill="#14892C" cx="12" cy="12" r="12"/><path fill="#FFF" d="M17.869 9.49l-1.201-1.342c-.176-.199-.482-.199-.678 0l-5.309 6.064c-.176.223-.48.223-.68 0l-1.92-2.188c-.197-.225-.504-.225-.68 0L6.2 13.366c-.176.225-.176.57 0 .77l3.037 3.48c.176.197.547.371.809.371h.568c.262 0 .611-.174.809-.371l6.445-7.355c.175-.199.175-.546.001-.771z"/></svg>';
    const SVG_CHECKMARK_GREY = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" style="scale:0.6;filter:grayscale(1.0);"><circle fill="#14892C" cx="12" cy="12" r="12"/><path fill="#FFF" d="M17.869 9.49l-1.201-1.342c-.176-.199-.482-.199-.678 0l-5.309 6.064c-.176.223-.48.223-.68 0l-1.92-2.188c-.197-.225-.504-.225-.68 0L6.2 13.366c-.176.225-.176.57 0 .77l3.037 3.48c.176.197.547.371.809.371h.568c.262 0 .611-.174.809-.371l6.445-7.355c.175-.199.175-.546.001-.771z"/></svg>';


    function identifyPrData() {
        let url = new URL(location.href);
        let parts = url.pathname.split('/');
        project = parts[1];
        repositoryName = parts[2];
        prId = parts[4];
    }

    function buildUrl(pathParts, params) {
        let url = new URL(pathParts.join('/'), API_BASE);
        for (let key in params) {
            url.searchParams.append(key, params[key]);
        }
        return url;
    }

    function loadCommitHashes() {
        let apiEndpoint = buildUrl(
            ['repositories', project, repositoryName, 'pullrequests', prId, 'commits'],
            {"pagelen": 100, "fields": "values.hash"}
        );
        return new Promise((resolve) => {
            GM.xmlHttpRequest({
                url: apiEndpoint.toString(),
                method: 'GET',
                headers: {
                    "Authorization": "Basic " + btoa(settings.bb_username + ':' + settings.bb_appPassword)
                },
                nocache: true,
                onreadystatechange: function (response) {
                    if (response.readyState === 4) {
                        let json = JSON.parse(response.responseText);
                        let hashList = json['values'].map(entry => entry.hash);
                        resolve(hashList);
                    }
                },
            });
        });
    }

    function handleCommitHashList(hashList) {
        let promises = [];
        for (let hash of hashList) {
            promises.push(getApproversForCommit(hash));
        }
        return Promise.all(promises);
    }

    function getApproversForCommit(hash) {
        let apiEndpoint = buildUrl(
            ['repositories', project, repositoryName, 'commit', hash],
            {"fields": "participants.user.display_name,participants.approved"}
        );
        return new Promise((resolve) => {
            GM.xmlHttpRequest({
                url: apiEndpoint.toString(),
                method: 'GET',
                headers: {
                    "Authorization": "Basic " + btoa(settings.bb_username + ':' + settings.bb_appPassword)
                },
                nocache: true,
                onreadystatechange: function (response) {
                    if (response.readyState === 4) {
                        let json = JSON.parse(response.responseText);
                        let participants = json.participants;
                        let result = {'hash': hash, 'participants': {}};
                        for (let index in participants) {
                            let username = participants[index].user.display_name;
                            let hasApproved = participants[index].approved;
                            result.participants[username] = {
                                "approved": hasApproved,
                                "applied": false
                            };
                        }

                        resolve(result);
                    }
                }
            });
        });
    }

    function updateCommitsHtml() {
        let commitTable = $(COMMIT_TABLE_SELECTOR);
        let colGroup =commitTable.find('colgroup')
        if(colGroup.find('col.approvers').length === 0 ) {
            colGroup.append('<col class="approvers"/>');
        }
        for (let index in commitData) {
            let hash = commitData[index].hash;
            let participants = commitData[index].participants;
            let message = [];
            let tableRow = $(COMMIT_TABLE_SELECTOR + ' span:contains("' + hash.substring(0, 7) + '")').first().parent().parent().parent().parent().parent();
            if (tableRow.length === 0) {
                // the commit is not shown yet, do not process the entry
                continue;
            }
            for (let pName in participants) {
                if(participants[pName].approved === false){
                    debugOutput(pName+" has not approved")
                    continue;
                }
                if(alreadyProcessedParticipants.hasOwnProperty(hash)){
                    debugOutput(hash+" is known in the alreadyProcessedParticipants object")
                    if (alreadyProcessedParticipants[hash].includes(pName)) {
                        debugOutput("Approval of "+pName+" is already shown");
                        continue;
                    }
                }
                let checkmarkNode = '<span title="' + pName + '">';
                if (pName === settings.bb_displayName) {
                    checkmarkNode += SVG_CHECKMARK_GREEN;
                } else {
                    checkmarkNode += SVG_CHECKMARK_GREY;
                }
                checkmarkNode += '</span>';
                message.push(checkmarkNode);
                participants[pName].applied = true;
                if (!alreadyProcessedParticipants.hasOwnProperty(hash)){
                    alreadyProcessedParticipants[hash] = [];
                }
                alreadyProcessedParticipants[hash].push(pName)
            }
            // find the cell containing the approvers and update (or create) it
            let approversCell = tableRow.children().filter('td.approvers');
            if (approversCell.length === 0) {
                tableRow.append('<td class="approvers">' + message.join('') + '</td>');
            }else{
                approversCell.innerHTML = message.join();
            }
        }
        if(settings['removeEmptyTds']){
            commitTable.find('tr > td > div:empty').remove();
            commitTable.find('tr > td:empty').remove();
        }
        debugOutput(alreadyProcessedParticipants)
    }

    function mutationCallback(mutationsList) {
        for (const mutation of mutationsList) {
            if (mutation.addedNodes.length === 0) {
                continue;
            }
            for (const addedNode of mutation.addedNodes) {
                let text = addedNode.textContent;
                if (text.endsWith('commit') || text.endsWith('commits')) {
                    updateCommitsHtml();
                }
            }
        }
    }

    function registerMutationObserver() {
        let headline = $(COMMIT_TABLE_HEADLINE_SELECTOR).parent().parent().parent();
        let observer = new MutationObserver(mutationCallback);
        observer.observe(headline.get(0), {childList: true})
    }

    function addRefreshButton() {
        let headline = $(COMMIT_TABLE_HEADLINE_SELECTOR).parent().parent().parent();
        let button = $('<button>Update approvers</button>');
        button.click(
            function (ev) {
                refreshApprovers();
                ev.stopPropagation();
            });
        headline.append(button);
    }

    function addLoadAllCommitsButton() {
        let headline = $(COMMIT_TABLE_HEADLINE_SELECTOR).parent().parent().parent();
        let button = $('<button>Load all commits</button>');
        button.click(
            function (ev) {
                inhibitLoading = false;
                loadMoreCommits();
                ev.stopPropagation();
            });
        headline.append(button);
    }

    function addStopLoadingCommitsButton() {
        let headline = $(COMMIT_TABLE_HEADLINE_SELECTOR).parent().parent().parent();
        let button = $('<button>Stop loading commits</button>');
        button.click(
            function (ev) {
                inhibitLoading = true;
                ev.stopPropagation();
            });
        headline.append(button);
    }

    function loadMoreCommits(){
        if (inhibitLoading === true) {
            debugOutput("Loading inhibited");
            return;
        }
        let span = $(LOAD_MORE_COMMITS_SELECTOR);
        if (span.length === 0) {
            debugOutput("No more commits to load");
            return;
        }
        span.parent().click();
        debugOutput("Clicked the load more button");
        setTimeout(loadMoreCommits, settings.loadMoreDelay);
    }

    function refreshApprovers() {
       debugOutput("Started to load / refresh approvers")
        loadCommitHashes().then(hashList => {
            debugOutput("Commit hashes received, querying commit details")
            handleCommitHashList(hashList).then(results => {
                debugOutput("All commit details received, updating HTML")
                commitData = results
                updateCommitsHtml();
            });
        });
    }

    function loadSettings() {
        const DEFAULT_SETTINGS = {
            bb_displayName: '',
            bb_username: '',
            bb_appPassword: '',
            activationDelay: 5000,
            removeEmptyTds: true,
            debugOutput: false,
            loadMoreDelay: 1000,
        }
        for (let key in DEFAULT_SETTINGS) {
            let value = GM_getValue(key, '!unset!');
            if (value === '!unset!') {
                value = DEFAULT_SETTINGS[key]
                GM_setValue(key, value);
            }
            settings[key] = value;
        }
    }

    function addTableHeader() {
        let commitTable = $(COMMIT_TABLE_SELECTOR);
        let newElement = commitTable.find("thead > tr > th:last-child").clone();
        newElement.html('<span>Approvers</span>');
        newElement.css('width','min-content');
        commitTable.find('thead > tr').append(newElement);
    }


    function startScript() {
        identifyPrData();
        registerMutationObserver();
        addRefreshButton();
        addLoadAllCommitsButton();
        addStopLoadingCommitsButton();
        addTableHeader();
        refreshApprovers();
    }

    function debugOutput(msg) {
        // noinspection EqualityComparisonWithCoercionJS
        if (settings['debugOutput'] == true){
            if(typeof msg == "string") {
                console.debug("[BBCA] " + msg)
            }else{
                console.debug("[BBCA] Object follows")
                console.debug(msg)
            }
        }
    }

    loadSettings();
    setTimeout(startScript, settings['activationDelay']);
})();
