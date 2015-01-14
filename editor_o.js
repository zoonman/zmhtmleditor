/**
 * Created by zoonman on 1/2/15.
 */
(function () {
  'use strict';

var setupEditor = function setupEditor(setupOptions) {

  var self = this;
  var initHtml;


  var options;
  options = setupOptions || {};

  var lang = {
    bold: 'Bold',
    italic: 'Italic',
    underline: 'Underline',
    strikeThrough: 'Strike Through',
    createLink: 'Link',
    insertImage: 'Image',
    heading: 'Insert Header',
    insertParagraph: 'Paragraph',
    table: 'Insert Table',
    subscript: 'Subscript',
    superscript: 'Superscript',
    insertOrderedList: 'Insert Ordered List',
    insertUnorderedList: 'Insert Unordered List',
    justifyLeft: 'Justify Left',
    justifyCenter: 'Justify Center',
    justifyRight: 'Justify Right',
    justifyFull: 'Justify Full',
    undo: 'Undo',
    redo: 'Redo',
    indent: 'Indent',
    outdent: 'Outdent',
    removeFormat: 'Remove Format',
    save: 'Save',
    attach: 'Attach',
    uploading: ''
  };
  var toolbarConfig = [
    {class: 'bold', command: 'bold'},
    {class: 'italic', command: 'italic'},
    {class: 'underline', command: 'underline'},
    {class: 'strikethrough', command: 'strikeThrough'},
    {class: 'spacer'},
    {class: 'link', command: 'createLink'},
    {class: 'image', command: 'insertImage'},
    {class: 'table', command: 'table'},
    {class: 'spacer'},
    {class: 'header', command: 'heading'},
    {class: 'paragraph', command: 'insertParagraph'},
    {class: 'subscript', command: 'subscript'},
    {class: 'superscript', command: 'superscript'},
    {class: 'list-ol', command: 'insertOrderedList'},
    {class: 'list-ul', command: 'insertUnorderedList'},
    {class: 'spacer'},
    {class: 'align-left', command: 'justifyLeft'},
    {class: 'align-center', command: 'justifyCenter'},
    {class: 'align-right', command: 'justifyRight'},
    {class: 'align-justify', command: 'justifyFull'},
    {class: 'spacer'},
    {class: 'undo', command: 'undo'},
    {class: 'repeat', command: 'redo'},
    {class: 'indent', command: 'indent'},
    {class: 'outdent', command: 'outdent'},
    {class: 'eraser', command: 'removeFormat'},
    {class: 'floppy-o', command: 'save'},
    {class: 'paperclip', command: 'attach'}

  ];


  options.iframeId = 'editor-' + (new Date())*1;

  console.log(options);

  self.getContentDocument = function() {
    return document.getElementById(options.iframeId).contentDocument;
  };

  self.setFocus = function() {
    return document.getElementById(options.iframeId).focus();
  };



  self.save = function(el) {
    var dropdown = document.getElementById(options.id).getElementsByClassName('dropdown');
    console.log(dropdown);
    if (dropdown) {
      dropdown = dropdown[0];
      dropdown.style.opacity = '1';
      dropdown.style.top = '28px';
      dropdown.style.left = el.offsetLeft + 'px';
      var inner = dropdown.getElementsByClassName('inner');
      if (inner) {
        inner = inner[0];
        inner.innerHTML = 'test';
      }
    }
    if (options.save) {
      options.save(self.getContentDocument().documentElement.outerHTML);
    } else {
      self.uploadFile(
          new File(
              [self.getContentDocument().documentElement.outerHTML],
              'document.html',
              {type: 'text/html'}
          ),
          function() {}
      );
    }
  };

  self.attach = function() {
    document.getElementById('file' + options.iframeId).click();
  };



  self.uploadFileDone = function(results) {
    for (var i in results) {
      if (results.hasOwnProperty(i)) {
        var result = results[i];
        switch (result.type) {
          case 'image/png':
          case 'image/gif':
          case 'image/jpg':
          case 'image/jpeg':
          case 'image/pjpeg':
            self.getContentDocument()
                .execCommand('insertImage', false, result.url);
            break;
          default:
            var html = '<a href="' + result.url + '" target="_blank">' +
                result.name + '</a>&nbsp;';
            self.getContentDocument().execCommand('insertHTML', false, html);
        }
      }
    }
  };

  function FileUploder(file, callback) {
    var fu = this;
    fu.id = 'uploader' + Math.random().toString().replace('0.', '');

    // create layout
    var uHtml = '';
    uHtml += '<div class="filename" id="fn' + fu.id + '" title="' + file.name +
        '">' + file.name + '</div>';
    uHtml += '<i class="progress-retry fa fa-repeat" title="Retry" id="rt' +
        fu.id + '"></i>';
    uHtml += '<i class="progress-cancel fa fa-times" title="Cancel" id="cn' +
        fu.id + '"></i>';
    uHtml += '<div class="progress-position"  id="pp' + fu.id + '"></div>';

    var uploadContainer = document.createElement('div');
    uploadContainer.setAttribute('id', fu.id);
    uploadContainer.setAttribute('class', 'progress-item');
    uploadContainer.innerHTML = uHtml;

    document.getElementById('uploads').appendChild(uploadContainer);

    document.getElementById('rt' + fu.id).addEventListener('click', function() {
      fu.xhr.abort();
      fu.xhr = fu.uploadFile(file);
      document.getElementById('rt' + fu.id).style.visibility = 'hidden';
    });

    document.getElementById('cn' + fu.id).addEventListener('click', function() {
      fu.xhr.abort();
      document.getElementById('uploads').removeChild(uploadContainer);
    });


    fu.updateUploadPercentage = function(file, percent) {
      console.timeStamp(percent);
      document.getElementById('pp' + fu.id).style.width = percent + '%';
    };

    fu.uploadFileFail = function() {
      console.timeStamp('fail');
      document.getElementById('rt' + fu.id).style.visibility = 'visible';
      document.getElementById('pp' + fu.id).style.width = '0%';
    };

    fu.uploadFileDone = function(result) {
      document.getElementById('uploads').removeChild(uploadContainer);
      if (callback) {
        callback(result);
      }
    };

    fu.uploadFile = function(file) {
      var xhr = new XMLHttpRequest();
      var formData = new FormData();
      formData.append('file', file);
      xhr.upload.addEventListener('progress', function(e) {
        if (e.lengthComputable) {
          var percentage = Math.round((e.loaded * 100) / e.total);
          fu.updateUploadPercentage(file, percentage);
        }
      }, false);
      xhr.upload.addEventListener('load', function() {
        fu.updateUploadPercentage(file, 100);
      }, false);
      xhr.addEventListener("load", function() {
        if (xhr.status === 200) {
          fu.uploadFileDone(xhr.response);
        } else {
          fu.uploadFileFail();
        }

      }, false);
      xhr.addEventListener('error', fu.uploadFileFail, false);
      xhr.open('POST', window.location.protocol + '//' + window.location.host + '/server.php');
      xhr.responseType= 'json';
      xhr.send(formData);
      return xhr;
    };

    fu.xhr = fu.uploadFile(file);
  }

  self.uploadFile = function(file, done) {
    var uploader = new FileUploder(file, done || self.uploadFileDone);
  };

  self.uploadFiles = function(files) {
    //console.log(files);
    if (files && files.length > 0) {
      for (var i = 0, l = files.length; i < l; i++) {
        self.uploadFile(files[i]);
      }
    }
  };

  self.buttonHandler = function(element) {
    if (element) {
      var command = element.target.dataset.command;
      switch (command) {
        case 'table':
          var tableHtml = '<table style="border-collapse: collapse;" border="1" width="100%"><thead><tr><th>1</th><th>2</th></tr></thead><tbody><tr><td>3</td><td>4</td></tr></tbody></table><p>&nbsp;</p>';
          self.getContentDocument().execCommand('insertHTML', false, tableHtml);
          break;
        case 'heading':
          self.getContentDocument().execCommand(command, false, 'h1');
          break;
        case 'save':
          self.save(element.target);
          break;
        case 'attach':
          self.attach(element.target);
          break;
        case 'createLink':
        case 'insertImage':
          var src = window.prompt('Type Image Url here:');
          if (src) {
            self.getContentDocument().execCommand(command, false, src);
          }
          break;
        default:
          self.getContentDocument().execCommand(command, false);
      }
    }

  };

  self.generateToolbarHtml = function() {
    var html ='<div class="toolbar" id="toolbar' + options.iframeId + '"><div class="middle">';
    for (var i in toolbarConfig) {
      if (toolbarConfig.hasOwnProperty(i)) {
        if (toolbarConfig[i].class === 'spacer') {
          html += '<i class="spacer"></i>';
        } else {
          html += '<i class="fa fa-' + toolbarConfig[i].class + '" data-command="' + toolbarConfig[i].command + '" title="' + lang[toolbarConfig[i].command] + '"></i>';
        }
      }
    }

    html += '</div></div><div class="dropdown"><div class="arrow"></div><div class="inner"></div></div>';
    html += '<input type="file" id="file' + options.iframeId + '" multiple style="display:none">';
    return html;
  };

  self.enableEditing = function() {
    self.adaptSize();

    self.getContentDocument().designMode = "on";


    self.getContentDocument().execCommand('insertHTML', false, initHtml);

    document.getElementById(options.iframeId).contentWindow.focus();

    var buttons = document.getElementsByClassName('fa');
    for (var i in buttons) {
      if (buttons.hasOwnProperty(i)) {
        var button = buttons[i];
        if (self && self.buttonHandler) {
          button.addEventListener('click', self.buttonHandler);
        }
      }
    }

    document.getElementById('file' + options.iframeId).addEventListener('change', function(e) {
      self.uploadFiles(this.files);
      e.preventDefault();
    }, false);

    self.getContentDocument().addEventListener('dragenter', self.showDropTarget, false);

    self.getContentDocument().addEventListener('dragover', self.showDropTarget, false);

    self.getContentDocument().addEventListener('dragleave', self.hideDropTarget, false);

    self.getContentDocument().addEventListener('drop', function(e) {
      var dt = e.dataTransfer;
      var files = dt.files;
      if (files && files.length > 0) {
        self.uploadFiles(dt.files);
        e.stopPropagation();
        e.preventDefault();
      }
      self.hideDropTarget();
    }, false);
  };

  self.init = function() {
    initHtml = document.getElementById(options.id).innerHTML;

    document.getElementById(options.id).innerHTML = self.generateToolbarHtml() +
    '<iframe class="area" id="' + options.iframeId + '"><'+'/iframe>';
    window.addEventListener('resize', self.adaptSize, false);
    document.getElementById(options.iframeId).addEventListener('load', function() {

    }, false);

    window.setTimeout(self.enableEditing, 10);


  };






  self.adaptSize = function() {
    var height = document.getElementById(options.id).clientHeight;
    var iframeHeight = height - 28;
    var width = document.getElementById(options.id).clientWidth;
    document.getElementById(options.iframeId).setAttribute('height', iframeHeight);
  };

  self.showDropTarget = function() {
    document.getElementById('toolbar' + options.iframeId).style.opacity = 0.5;
  };

  self.hideDropTarget = function() {
    document.getElementById('toolbar' + options.iframeId).style.opacity = 1;
  };

};

  window.setupEditor = setupEditor;

}());