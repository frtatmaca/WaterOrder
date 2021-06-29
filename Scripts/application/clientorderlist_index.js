var clientorderlist_index = (function ($) {

    var viewModel = function () {
        this.MessageId = ko.observable();
        this.SessionId = ko.observable();
        this.SenderUserId = ko.observable();
        this.SenderUserName = ko.observable();
        this.Subject = ko.observable();
        this.FileName = ko.observable();
        this.SessionName = ko.observable();
        this.CreatedDate = ko.observable();

        this.ActivityList = ko.observableArray();

        /*paging*/
        this.currentPageNumber = ko.observable();
        this.totalPageNumber = ko.observable();
        this.totalCount = ko.observable();
        this.firstIndex = ko.observable();
        this.lastIndex = ko.observable();
        this.order = ko.observable();
        /*paging*/
    };

    var isAdvanced = false, binded = false;
    var item;
    var pub = {};


    function activity(OrderId,CarboyId, CarboyStatus, CreatedDate, CarboyName, CarboyAddress, UserId, UserName, FirstName, LastName) {
        this.OrderId = ko.observable(OrderId);
        this.CarboyId = ko.observable(CarboyId);
        this.CarboyStatus = ko.observable(CarboyStatus);
        this.CreatedDate = ko.observable(CreatedDate);
        this.CarboyName = ko.observable(CarboyName);
        this.CarboyAddress = ko.observable(CarboyAddress);
        this.UserId = ko.observable(UserId);
        this.UserName = ko.observable(UserName);
        this.FirstName = ko.observable(FirstName);
        this.LastName = ko.observable(LastName);
    }

    function LoadFromServer(pageNum, url) {
        $.ajax({
            url: "/Home/ClientOrderList/",
            type: "POST",
            dataType: "json",
            data: url,
            success: function (data) {
                var totalC = data[1];
                var itemCountInPage = data[2];

                item.currentPageNumber(pageNum);
                item.totalCount(totalC);

                if (pageNum == 1) {
                    item.totalPageNumber(totalC == null ? null : Math.ceil(totalC / itemCountInPage));
                    item.firstIndex(item.totalCount() == 0 ? 0 : ((pageNum * itemCountInPage) - (itemCountInPage - 1)));
                    item.lastIndex(pageNum * itemCountInPage);
                }
                else {
                    item.firstIndex((item.currentPageNumber() * $("#tablePageSize").val()) - ($("#tablePageSize").val() - 1));
                    item.lastIndex((item.currentPageNumber() - 1) * $("#tablePageSize").val() + itemCountInPage);
                }

                bindList(data[0]);

                $("#RecordsCount").html(data[1]);

                if (!isAdvanced && $("#linkAdvanced").hasClass("collapse"))
                    $("#linkAdvanced").click();
            },
            error: function (res) {
                console.log("Error in process.");
            }
        });
    }


    function getFilters(skip, top, isAdvanced) {
        if (isAdvanced) {            
            return getAdvancedSearchFilters(skip, top);
        }
    }

    function getAdvancedSearchFilters(skip, top) {
        var searchKey = $('#searchKey').val();
        var carboyStatus = $("#carboyStatus").val();

        return { "searchKey": searchKey, "carboyStatus": carboyStatus, "skip": skip, "top": top };
    }

    pub.pagerAction = function (action, pageNum) {
        /*
        1 - first
        2 - previous
        3 - next
        4 - last
        5 - number
        */

        if (action == 1) { // first
            if ($("li.first").hasClass("disabled")) {
            }
            else {
                LoadFromServer(1, getFilters(0, $("#tablePageSize").val(), isAdvanced));
            }
        }
        else if (action == 2) { // previous
            if ($("li.prev").hasClass("disabled")) {
            }
            else {
                LoadFromServer(item.currentPageNumber() - 1, getFilters((item.currentPageNumber() - 2) * $("#tablePageSize").val(), $("#tablePageSize").val(), isAdvanced));
            }
        }
        else if (action == 3) { // next
            if ($("li.next").hasClass("disabled")) {
            }
            else {
                LoadFromServer(item.currentPageNumber() + 1, getFilters(item.currentPageNumber() * $("#tablePageSize").val(), $("#tablePageSize").val(), isAdvanced));
            }
        }
        else if (action == 4) { // last
            if ($("li.last").hasClass("disabled")) {
            }
            else {
                var skp = parseInt((item.totalPageNumber() - 1) * $("#tablePageSize").val());
                LoadFromServer(item.totalPageNumber(), getFilters(skp, $("#tablePageSize").val(), isAdvanced));
            }
        }
        else if (action == 5) { //number
            if ($("li[id^='nmbr" + pageNum + "']").hasClass("active")) {
            }
            else {
                var skp = parseInt((pageNum - 1) * $("#tablePageSize").val());
                LoadFromServer(pageNum, getFilters(skp, $("#tablePageSize").val(), isAdvanced));
            }
        }
    }

    pub.indexChanged = function () {
        $("#ul_paging").html('');
        if (item.totalPageNumber() > 1) {
            buildPagerDiv();

            if (item.currentPageNumber() == 1) {
                $("li.first").addClass("disabled");
                $("li.prev").addClass("disabled");
            }
            else {
                $("li.first").removeClass("disabled");
                $("li.prev").removeClass("disabled");
            }

            if (item.currentPageNumber() == item.totalPageNumber()) {
                $("li.next").addClass("disabled");
                $("li.last").addClass("disabled");
            }
            else {
                $("li.next").removeClass("disabled");
                $("li.last").removeClass("disabled");
            }

            $("li[id^='nmbr']").removeClass("active");
            $("li[data-id=" + item.currentPageNumber() + "]").addClass("active");
        }
    }

    function bindList(data) {
        var results = ko.observableArray();
        ko.mapping.fromJS(data, {}, results);
        item.ActivityList.removeAll();
        for (var i = 0; i < results().length; i++) {
            item.ActivityList.push(
                new activity(
                    results()[i].OrderId(),
                    results()[i].CarboyId(),
                    results()[i].CarboyStatus(),
                    results()[i].CreatedDate(),
                    results()[i].CarboyName() != null ? results()[i].CarboyName() : "",
                    results()[i].CarboyAddress(),
                    results()[i].UserId(),
                    results()[i].UserName(),
                    results()[i].FirstName(),
                    results()[i].LastName()
                )
            );
        }

        pub.indexChanged();
    }

    function buildPagerDiv() {
        $("#ul_paging").html('');

        var html = '<li class="first paginate_button paginate_button_disabled"><a href="javascript:clientorderlist_index.pagerAction(1, 0);">' + "First" + '</a></li>';
        $("#ul_paging").append(html);

        html = '<li class="prev paginate_button paginate_button_disabled"><a href="javascript:clientorderlist_index.pagerAction(2, 0);">← ' + "Prev" + '</a></li>';
        $("#ul_paging").append(html);

        if (item.totalPageNumber() < 5) {
            for (var i = 1; i <= item.totalPageNumber() ; i++) {
                html = '<li id="nmbr' + i + '" data-id="' + i + '"><a href="javascript:clientorderlist_index.pagerAction(5, ' + i + ');">' + i + '</a></li>';
                $("#ul_paging").append(html);
            }
        }
        else {
            if (item.currentPageNumber() <= 3) {
                for (var i = 1; i <= 5 ; i++) {
                    html = '<li id="nmbr' + i + '" data-id="' + i + '"><a href="javascript:clientorderlist_index.pagerAction(5, ' + i + ');">' + i + '</a></li>';
                    $("#ul_paging").append(html);
                }
            }
            else if (item.currentPageNumber() >= item.totalPageNumber() - 2) {
                for (var i = item.totalPageNumber() - 4; i <= item.totalPageNumber() ; i++) {
                    html = '<li id="nmbr' + i + '" data-id="' + i + '"><a href="javascript:clientorderlist_index.pagerAction(5, ' + i + ');">' + i + '</a></li>';
                    $("#ul_paging").append(html);
                }
            }
            else {
                for (var i = item.currentPageNumber() - 2; i <= item.currentPageNumber() + 2 ; i++) {
                    html = '<li id="nmbr' + i + '" data-id="' + i + '"><a href="javascript:clientorderlist_index.pagerAction(5, ' + i + ');">' + i + '</a></li>';
                    $("#ul_paging").append(html);
                }
            }
        }

        html = '<li class="next"><a href="javascript:clientorderlist_index.pagerAction(3, 0);">' + "Next" + ' →</a></li>';
        $("#ul_paging").append(html);

        html = '<li class="last"><a href="javascript:clientorderlist_index.pagerAction(4, 0);">' + "Last" + '</a></li>';
        $("#ul_paging").append(html);
    }

    $('.checkall').toggle(
           function () {
               $('.commentApprove').attr('Checked', 'Checked');
               $('.aligncenter').each(function () {
                   $(this).find('span').addClass('checked');
               });
           },
           function () {
               $('.commentApprove').removeAttr('Checked');

               $('.aligncenter').each(function () {
                   $(this).find('span').removeClass('checked');
               });
           }
       );

    pub.init = function () {
        // $(".getReport").click(function () {
        isAdvanced = true;
        if (!binded) {
            item = new viewModel();
        }

        LoadFromServer(1, getFilters(0, $("#tablePageSize").val(), isAdvanced));

        if (!binded) {
            ko.applyBindings(item);
            binded = true;
            $(".divOuter").show();
        }
        //});

        $("#btnSearch").click(function () {
            LoadFromServer(1, getFilters(0, $("#tablePageSize").val(), isAdvanced));
        });

        $("#tablePageSize").change(function () {
            LoadFromServer(1, getFilters(0, $("#tablePageSize").val(), isAdvanced));
        });
    };

    pub.ActivityList = function () {
        return (item.ActivityList());
    };

    pub.TotalCountView = function () {
        return item.totalCount;
    };

    return pub;
}(jQuery));