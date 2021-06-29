//function jGrowlOpen(description, title) {
//    $.jGrowl(description, {
//        header: title,
//        life: 5000,
//        theme: 'manilla',
//        speed: 'slow',
//        animateOpen: {
//            height: "show",
//            width: "show"
//        },
//        animateClose: {
//            height: "hide",
//            width: "show"
//        }
//    });
//}



$(function () {
    'use strict';
    var form = $("form");
    $("#btnCancel").on("click", function () {
        window.close();
    });

    var valDescription = "";
    $('#fileupload').fileupload({
        url: '/Home/Create/',
        replaceFileInput: false,
        fileInput: $("input:file"),
        add: function (e, data) {
            var goUpload = true;
            var uploadFile = data.files[0];

            if (!(/\.(jpg|jpeg|png)$/i).test(uploadFile.name)) {
                alert('Zin verilen dosya türleri : jpg|jpeg|png');
                goUpload = false;
            }
            if (uploadFile.size > 150000000) {
                alert('Dosya boyutu en fazla 15 mb olabilir.');
                goUpload = false;
            }


            if (goUpload === true) {
                $('#fileContainer').html('<i class="fa fa-file"></i>&nbsp;' + data.files[0].name);

                data.context = $('#btnSave');
                data.context.off();
                data.context.click(function () {
                    data.context.text('Kaydediliyor...').replaceAll($(this));
                    data.context.addClass('disabled');
                    data.submit();
                    form.submit(function (e) {
                        e.preventDefault();
                    });
                });
            }

        },
        done: function (e, data) {

            if (data.result.status === "success") {
                //jGrowlOpen("Tebrikler. Kaydınız Gerçekleştirildi.", "Bilgi");
                //setTimeout(function () {
                //    window.location.reload();
                //}, 5000);

                window.location.reload();
            } else {
                if (data.result.status === "warning") {
                    // ShowGritter('Kayıt Yapılamadı', data.result.message, 'warning');
                } else {
                    //ShowGritter('Hata Oluştu', data.result.message, 'error');
                    alert("Gerekli Alanalrı Doldurunuz.");
                }
                $('#btnCreate').removeClass('disabled').text('Kaydet');
            }

        },
        fail: function (e, data) {
            //ShowGritter('Hata Oluştu', data.result.message, 'error');
            $('#btnCreate').removeClass('disabled').text('Kaydet');

        }
    }).on('fileuploadprogressall', function (e, data) {
        var progress = parseInt(data.loaded / data.total * 100, 10);
        $('.progress .progress-bar').css('width', progress + '%');
    });

});

