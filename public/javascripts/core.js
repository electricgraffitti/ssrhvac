var Flash = {

  injectFlashBox: function() {
    $('#flash').addClass("flash_wrap");
    $("#flash").hide();
  },

  setFlash: function() {
    var flash_message = $("#flash").html();
    var msg = $.trim(flash_message);
    if (msg !== "") {
      Flash.activateNotice(flash_message);
    }
  },

  activateNotice: function(flash_message) {
    var flash_div = $("#flash");
    flash_div.html(flash_message);
    flash_div.show("slide", {
      direction: 'up'
    });
    // Set the fadeout
    setTimeout(function() {
      flash_div.hide("slide", {
        direction: 'up'
      },
      function() {
        flash_div.html("");
        flash_div.hide();
      });
    },
    2500);
  }
};

var Ajax = {
  
  ajaxIcon: "<p>Processing... <img src='images/ajax-loader.gif'/></p>",

  ajaxFlash: function() {
    
  },

  ajaxStatus: function() {
    var status = $("#ajax_status");

    $.ajaxSetup({
      beforeSend: function(xhr) {
        xhr.setRequestHeader('X-CSRF-Token', $('meta[name="csrf-token"]').attr('content'));
      }
    });

    $("body").ajaxStart(function() {
      status.show();
    });

    $("body").ajaxStop(function() {
      status.fadeOut();
    });
  }
};

var Video = {
  
  initVideos: function() {
    Video.triggerVideo();
  },

  triggerVideo: function() {
    var triggerLink = $(".user_video_trigger");

    triggerLink.on("click", function() {
      var url = $(this).data("url"),
          thumb = $(this).data("thumb");

      Video.playVideo(url, thumb);
    });
  },

  closeVideo: function() {
    var closeLink = $(".close_link");

    closeLink.on("click", function(e) {
      var playerWrapper = $(this).siblings("#player");

      playerWrapper.html("");
      $.mask.close();
      $(this).remove();
      e.preventDefault();
    });
  },

  playVideo: function(videoUrl,videoThumbUrl) {
    var playerWindow = $("#player"),
        playerWrap = playerWindow.parent();

    playerWrap.expose({
      color: '#000',
      loadSpeed: 200,
      opacity: 0.9,
      closeOnClick: false
    });

    playerWrap.addClass("center_wrap");
    playerWrap.removeAttr("style");
    playerWrap.append("<div id='close_link' class='close_link close'></div>");
    
    flowplayer("player", "/flowplayer/flowplayer-3.2.7.swf", {
      clip: {
        url: videoUrl,
        scaling: 'orig'
      },
      plugins: {
        controls: {
          url: '/flowplayer/flowplayer.controls-3.2.5.swf',
          playlist: false,
          backgroundColor: '#000', 
          time: false,
          fullscreen: true,
          volume: false,
          bufferColor: '#666666',
          buttonColor: '#666666',
          tooltips: {
            buttons: true, 
            fullscreen: 'Fullscreen' 
          } 
        }
      }
    });
    Video.closeVideo();
  }
};

var Modal = {

  createModal: function(insertedData, titleText){
    var modalWrap = $("<div id='modal_wrap'></div>"),
        modalTitle = $("<span id='modal_title'></span>"),
        modalHeader = $("<div id='modal_header' class='black_gradient'></div>"),
        modalCloseLink = $("<div id='close_modal_link' class='button close_button red_button'>X</div>"),
        modalContent = $("<div id='modal_content'></div>");
        
        if (titleText != undefined) {
          modalTitle.text(titleText);
          modalHeader.prepend(modalTitle);
        }
        modalContent.append(insertedData);
        modalHeader.append(modalCloseLink);
        modalWrap.append(modalHeader).append(modalContent);
        return modalWrap;
  },

  confirmDelete: function(message, callback) {
    var confirmMessage = (message ? message : "Are you sure you want to delete?"),
        confirmContent = Modal.confirmModalContent(confirmMessage),
        modal = Modal.loadModal(confirmContent);

    Modal.activateConfirm(callback);
  },

  confirmModalContent: function(message) {
    var confirmWrap = $("<div id='confirm_wrap'></div>"),
        confirmMessage = $("<div id='confirm_message'></div>"),
        confirmOkButton = $("<span id='confirm_ok' class='button green_button'>Ok</div>"),
        confirmCancelButton = $("<span id='confirm_cancel' class='button red_button'>Cancel</div>");

        confirmMessage.text(message);
        confirmWrap.append(confirmMessage).append(confirmOkButton).append(confirmCancelButton);

        return confirmWrap;
  },

  activateConfirm: function(callback) {
    var modal = $("#modal_wrap"),
        okButton = $("#confirm_ok"),
        cancelButton = $("#confirm_cancel");

    okButton.on("click", function() {
      modal.remove();
      callback();
    });
    cancelButton.on("click", function() {
      modal.remove();
      return false;
    });
  },

  loadModal: function(insertedData, titleText) {
    var modal = Modal.createModal(insertedData, titleText);
        
    $('body').append(modal);
    Modal.closeModal();
    Modal.dragModal();
  },

  dragModal: function() {
    var modal = $("#modal_wrap"),
        modalHeader = modal.find("#modal_header");
      
    modal.draggable({
      handle: modalHeader
    });
  },

  closeModal: function() {
    var closeLink = $("#close_modal_link");

    closeLink.on("click", function() {
      Modal.removeModal();
    });
  },

  removeModal: function() {
    var modal = $("#modal_wrap");
    modal.remove();
  }

};

var Tabs = {
  
  initTabs: function() {
    var tabs = $(".tab");

    tabs.on("click", function() {
      var tabSet = $(this).parents(".tab_set").first(),
          tabPanels = tabSet.find(".tab_panel"),
          panelId = $(this).data("panel"),
          currentPanel = $(this).parents(".tab_set").find("#" + panelId);

          tabs.removeClass("active");
          $(this).addClass("active");
          tabPanels.removeClass("active");
          currentPanel.addClass("active");

    });   
  }
};

var App = {

  initDeleteLinks: function() {
    var deleteLinks = $(".delete_link");

    deleteLinks.on("click", function(e) {
      var self = $(this);
      
      Modal.confirmDelete("Are you sure that you want to delete this record?", function() {
        App.deleteRecord(self);
      });
      e.preventDefault();
    });
  },

  deleteRecord: function(link) {
    var url = link.attr("href"),
        parent = link.parents(".delete_parent").first();

    $.ajax({
      url: url,
      type: "DELETE",
      success: function(response) {
        parent.remove();
        Modal.loadModal("Record deleted.");
      },
      error: function(response, text, message) {
        var errorMessage = text + " - " + message;
        Modal.loadModal(errorMessage);
      }
    }); 
  },
};

//**********Initialize Document**********//
$(document).ready(function() {
  Flash.injectFlashBox();
  Flash.setFlash();
  Video.initVideos();
  App.initDeleteLinks();
});