// Edit: 9.4.14
// **** BEGIN: Get Brackets **** //

var segId = window.location.href.slice(window.location.href).split('/');
segId = segId[segId.length - 1];

var bracketsObject;
$.getJSON('/Brackets/GetBrackets', { id: segId }, function (data) {
    bracketsObject = data;

    var an = $("#an");
    var na = $("#na");

    var isAfcOnLeft = bracketsObject.IsAfcOnLeft;

    if (isAfcOnLeft) {
        an.removeClass("hide");
    } else {
        na.removeClass("hide");
    }

}).fail(function () {
    alert("There was an error getting data from the server.");
});

var afcTeams;
$.getJSON('/Brackets/GetAFCTeams', function (data) {
    afcTeams = $.map(data, function (team) {
        return new TeamModel(team, false);
    });
});

var nfcTeams;
$.getJSON('/Brackets/GetNFCTeams', function (data) {
    nfcTeams = $.map(data, function (team) {
        return new TeamModel(team, false);
    });
});

function SetBindings(bracketsObject, afcTeams, nfcTeams) {
    ko.applyBindings(new BracketsViewModel(bracketsObject, afcTeams, nfcTeams), $("#brackets")[0]);
}

$("#progressBar").animate({ width: "100%" }, 1500, function() {
    $("#progressSection").fadeOut(1500);
});

setTimeout(function () {
    SetBindings(bracketsObject, afcTeams, nfcTeams);
}, 1500);

// **** END: Get Brackets **** //


// Knockout Binding For Brackets App
function BracketsViewModel(bracketsObject, afcTeams, nfcTeams) {
    var self = this;
    self.SegmentTitle = ko.observable(bracketsObject ? bracketsObject.SegmentName : "");
    self.Logos = ko.observableArray([]);
    self.SelectedLogo = ko.observable();
    self.WildCardTitle = ko.observable(bracketsObject ? bracketsObject.Labels[0] : "");
    self.DivisionalTitle = ko.observable(bracketsObject ? bracketsObject.Labels[1] : "");
    self.ChampionsTitle = ko.observable(bracketsObject ? bracketsObject.Labels[2] : "");

    $.getJSON('/Brackets/GetLogos', function (data) {
        $.each(data, function (i, item) {
            self.Logos.push(item.Key);
        });

        self.SelectedLogo(bracketsObject ? bracketsObject.Logo : "");
    });

    // **** BEGIN: AFC Bindings **** //

    self.AfcTeams = ko.observableArray([]);

    // Populate AFC Team array
    $.each(afcTeams, function (i, item) {
        self.AfcTeams.push(item);
    });

    // Temporary array that holds Team object
    self.AfcSelectedWildCards = [];
    for (var i = 0; i <= 5; i++) {
        if (bracketsObject) {
            self.AfcSelectedWildCards.push(ko.observable(new TeamModel(bracketsObject.AfcTeams[i], true)));
        }
    }

    self.AfcDummyDivision = ko.observable();
    // Holds selected teams that go to Divisional
    self.AfcDivisionals = ko.computed(function () {
        self.AfcDummyDivision(); // Used to force computed function to execute
        var tmp = [];
        ko.utils.arrayForEach(self.AfcSelectedWildCards, function (team) {
            if (team()) {
                var tempTeam = ko.utils.arrayFirst(self.AfcTeams(), function(item) {
                    return team().Tri == item.Tri;
                });
                tmp.push(tempTeam ? tempTeam : new TeamModel(tempTeam, false));
            }
        });
        return tmp;
    });

    //console.log(self.AfcDivisionals());

    // Temporary array that holds Team object
    self.AfcSelectedDivisionalTeams = [];
    for (var i = 6; i <= 9; i++) {
        if (bracketsObject) {
            self.AfcSelectedDivisionalTeams.push(ko.observable(new TeamModel(bracketsObject.AfcTeams[i], true)));
        }
    }

    self.AfcDummyChampionship = ko.observable();
    // Holds selected teams that go to Championship
    self.AfcChampionship = ko.computed(function () {
        self.AfcDummyChampionship();
        var tmp = [];
        ko.utils.arrayForEach(self.AfcSelectedDivisionalTeams, function (team) {
            if (team()) {
                var tempTeam = ko.utils.arrayFirst(self.AfcTeams(), function (item) {
                    return team().Tri == item.Tri;
                });
                tmp.push(tempTeam ? tempTeam : new TeamModel(tempTeam, false));
            }
        });

        return tmp;
    });

    // Temporary array that holds Team object
    self.AfcSelectedChampions = [];
    for (var i = 10; i <= 11; i++) {
        if (bracketsObject) {
            self.AfcSelectedChampions.push(ko.observable(new TeamModel(bracketsObject.AfcTeams[i], true)));
        }
    }

    self.AfcDummyChampions = ko.observable();
    // Holds selected teams that go to final round
    self.AfcChampions = ko.computed(function () {
        self.AfcDummyChampions();
        var tmp = [];
        ko.utils.arrayForEach(self.AfcSelectedChampions, function (team) {
            if (team()) {
                var tempTeam = ko.utils.arrayFirst(self.AfcTeams(), function (item) {
                    return team().Tri == item.Tri;
                });
                tmp.push(tempTeam ? tempTeam : new TeamModel(tempTeam, false));
            }
        });

        return tmp;
    });

    // Holds AFC Champion
    self.AfcChampion = ko.observable(new TeamModel(bracketsObject.AfcTeams[12], true));

    // Hack to force new item selected to be added to array
    $("#afcTeams").on("change", "select", function () {
        self.AfcDummyDivision.notifySubscribers(); 
        self.AfcDummyChampionship.notifySubscribers();
        self.AfcDummyChampions.notifySubscribers();
    });

    // **** END: AFC Bindings **** //



    // **** BEGIN: NFC Bindings **** //

    self.NfcTeams = ko.observableArray([]);

    // Populate NFC Team array
    $.each(nfcTeams, function (i, item) {
        self.NfcTeams.push(item);
    });

    // Temporary array that holds Team object
    self.NfcSelectedWildCards = [];
    for (var i = 0; i <= 5; i++) {
        if (bracketsObject) {
            self.NfcSelectedWildCards.push(ko.observable(new TeamModel(bracketsObject.NfcTeams[i], true)));
        }
    }

    self.NfcDummyDivision = ko.observable();
    // Holds selected teams that go to Divisional
    self.NfcDivisionals = ko.computed(function () {
        self.NfcDummyDivision();
        var tmp = [];
        ko.utils.arrayForEach(self.NfcSelectedWildCards, function (team) {
            if (team()) {
                var tempTeam = ko.utils.arrayFirst(self.NfcTeams(), function (item) {
                    return team().Tri == item.Tri;
                });
                tmp.push(tempTeam ? tempTeam : new TeamModel(tempTeam, false));
            }
        });

        return tmp;
    });

    // Temporary array that holds Team object
    self.NfcSelectedDivisionalTeams = [];
    for (var i = 6; i <= 9; i++) {
        if (bracketsObject) {
            self.NfcSelectedDivisionalTeams.push(ko.observable(new TeamModel(bracketsObject.NfcTeams[i], true)));
        }
    }

    self.NfcDummyChampionship = ko.observable();
    // Holds selected teams that go to Championship
    self.NfcChampionship = ko.computed(function () {
        self.NfcDummyChampionship();
        var tmp = [];
        ko.utils.arrayForEach(self.NfcSelectedDivisionalTeams, function (team) {
            if (team()) {
                var tempTeam = ko.utils.arrayFirst(self.NfcTeams(), function (item) {
                    return team().Tri == item.Tri;
                });
                tmp.push(tempTeam ? tempTeam : new TeamModel(tempTeam, false));
            }
        });

        return tmp;
    });

    self.AfcDummyChampions = ko.observable();
    // Temporary array that holds Team object
    self.NfcSelectedChampions = [];
    for (var i = 10; i <= 11; i++) {
        if (bracketsObject) {
            self.NfcSelectedChampions.push(ko.observable(new TeamModel(bracketsObject.NfcTeams[i], true)));
        }
    }

    self.NfcDummyChampions = ko.observable();
    // Holds selected teams that go to final round
    self.NfcChampions = ko.computed(function () {
        self.NfcDummyChampions();
        var tmp = [];
        ko.utils.arrayForEach(self.NfcSelectedChampions, function (team) {
            if (team()) {
                var tempTeam = ko.utils.arrayFirst(self.NfcTeams(), function (item) {
                    return team().Tri == item.Tri;
                });
                tmp.push(tempTeam ? tempTeam : new TeamModel(tempTeam, false));
            }
        });

        return tmp;
    });

    // Holds NFC Champion
    self.NfcChampion = ko.observable(new TeamModel(bracketsObject.NfcTeams[12], true));

    $("#nfcTeams").on("change", "select", function () {
        self.NfcDummyDivision.notifySubscribers();
        self.NfcDummyChampionship.notifySubscribers();
        self.NfcDummyChampions.notifySubscribers();
    });

    // **** END: NFC Bindings **** //


    // **** BEGIN: Image Bindings **** //

    self.IsAfcOnLeft = ko.observable(bracketsObject ? bracketsObject.IsAfcOnLeft : true);

    self.SwapLogos = function () {
        var an = $("#an");
        var na = $("#na");

        if (self.IsAfcOnLeft() == true) {
            self.IsAfcOnLeft(!self.IsAfcOnLeft());

            na.hide();
            na.removeClass("hide");

            an.toggle("clip", { direction: "horizontal" }, function () {
                an.addClass("hide");
                na.toggle("clip", { direction: "horizontal" });
            });
        } else {
            self.IsAfcOnLeft(!self.IsAfcOnLeft());

            an.hide();
            an.removeClass("hide");

            na.toggle("clip", { direction: "horizontal" }, function () {
                na.addClass("hide");
                an.toggle("clip", { direction: "horizontal" });
            });
        }
    };

    // **** END: Image Bindings **** //



    // **** BEGIN: Submit Brackets **** //

    self.SubmitEnable = ko.observable(true);
    self.SubmitBrackets = function () {
        self.SubmitEnable(false);
        self.AfcSelectedTeams = [];
        self.NfcSelectedTeams = [];
        self.Labels = [];

        // Saves all selected teams into one array to convert to JSON

        // AFC Array
        ko.utils.arrayForEach(self.AfcSelectedWildCards, function (team) {
            if (team()) {
                self.AfcSelectedTeams.push(team());
            } else {
                self.AfcSelectedTeams.push(new TeamModel(null));
            }
        });

        ko.utils.arrayForEach(self.AfcSelectedDivisionalTeams, function (team) {
            if (team()) {
                self.AfcSelectedTeams.push(team());
            } else {
                self.AfcSelectedTeams.push(new TeamModel(null));
            }
        });

        ko.utils.arrayForEach(self.AfcSelectedChampions, function (team) {
            if (team()) {
                self.AfcSelectedTeams.push(team());
            } else {
                self.AfcSelectedTeams.push(new TeamModel(null));
            }
        });

        if (self.AfcChampion()) {
            self.AfcSelectedTeams.push(self.AfcChampion());
        } else {
            self.AfcSelectedTeams.push(new TeamModel(null));
        }

        // NFC Array
        ko.utils.arrayForEach(self.NfcSelectedWildCards, function (team) {
            if (team()) {
                self.NfcSelectedTeams.push(team());
            } else {
                self.NfcSelectedTeams.push(new TeamModel(null));
            }
        });

        ko.utils.arrayForEach(self.NfcSelectedDivisionalTeams, function (team) {
            if (team()) {
                self.NfcSelectedTeams.push(team());
            } else {
                self.NfcSelectedTeams.push(new TeamModel(null));
            }
        });

        ko.utils.arrayForEach(self.NfcSelectedChampions, function (team) {
            if (team()) {
                self.NfcSelectedTeams.push(team());
            } else {
                self.NfcSelectedTeams.push(new TeamModel(null));
            }
        });

        if (self.NfcChampion()) {
            self.NfcSelectedTeams.push(self.NfcChampion());
        } else {
            self.NfcSelectedTeams.push(new TeamModel(null));
        }

        self.Labels.push(self.WildCardTitle() ? self.WildCardTitle() : "");
        self.Labels.push(self.DivisionalTitle() ? self.DivisionalTitle() : "");
        self.Labels.push(self.ChampionsTitle() ? self.ChampionsTitle() : "");

        var Brackets = {
            "SegmentName": self.SegmentTitle() ? self.SegmentTitle() : "",
            "IsAfcOnLeft": self.IsAfcOnLeft(),
            "Logo": self.SelectedLogo ? self.SelectedLogo() : "",
            "AfcTeams": self.AfcSelectedTeams,
            "NfcTeams": self.NfcSelectedTeams,
            "Labels": self.Labels,
        };

        $.post('/Brackets/ManageSegment', { bracketsJson: ko.toJSON(Brackets), segId: segId }, function (url) {
            window.location.href = url;
        }).fail(function () {
            alert("An error occured saving Brackets data");
            self.SubmitEnable(true);
            console.log(Brackets);
        });
    };

    // **** END: Submit Brackets **** //
}


function TeamModel(data, isPreData) {
    if (isPreData) { // Data from server
        this.Tri = data.Tri;
        this.Name = data.Name;
        this.Rank = ko.observable(data.Rank);
    } else { // New object
        if (data) {
            this.Tri = data.Tricode;
            this.Name = data.DisplayName;
        } else {
            this.Tri = "";
            this.Name = "";
        }
        this.Rank = ko.observable(0);
    }
}