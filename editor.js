/**
 * Created by zoonman on 1/2/15.
 */
(function () {
  'use strict';

  var zmEditor = function(setupOptions) {
    this.init(setupOptions);
  };

  zmEditor.prototype.randomId = function(prefix) {
    prefix = prefix || '';
    return prefix + Math.random().toString().replace('0.', '');
  };

  zmEditor.prototype.init = function(setupOptions) {
    var options = setupOptions || {};

    var defaultOptions = {
        lang: {
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
        },
        toolbarConfig: [
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
        ],
      uploadUrl: window.location.protocol + '//' + window.location.host + '/server.php',
      customCssUrl: 'custom.css'
    };

    function extend(a, b) {
      for (var key in b) {
        if (b.hasOwnProperty(key)) {
          a[key] = b[key];
        }
      }
      return a;
    }

    this.options = extend(options, defaultOptions);
    this.iframeId = this.randomId('ZmEditor');

    this.initHtml = document.getElementById(this.options.id).innerHTML;

    document.getElementById(this.options.id).className += ' ZmHtmlEditor';
    document.getElementById(this.options.id).innerHTML = this.generateToolbarHtml() +
    '<iframe class="area" id="' + this.iframeId + '"><'+'/iframe>';

    window.addEventListener('resize', this.adaptSize.bind(this), false);

    //document.getElementById(this.iframeId).addEventListener('load', this.enableEditing.bind(this), false);
    window.setTimeout( this.enableEditing.bind(this), 100);
    // this.enableEditing();
  };

  zmEditor.prototype.getContentDocument = function() {
    return document.getElementById(this.iframeId).contentDocument;
  };

  zmEditor.prototype.setFocus = function() {
    return document.getElementById(this.iframeId).focus();
  };

  zmEditor.prototype.showDropTarget = function() {
    document.getElementById('toolbar' + this.iframeId).style.opacity = 0.5;
  };

  zmEditor.prototype.hideDropTarget = function() {
    document.getElementById('toolbar' + this.iframeId).style.opacity = 1;
  };


  zmEditor.prototype.generateToolbarHtml = function() {
    var html ='<div class="toolbar" id="toolbar' + this.iframeId + '"><div class="middle">';
    for (var i in this.options.toolbarConfig) {
      if (this.options.toolbarConfig.hasOwnProperty(i)) {
        if (this.options.toolbarConfig[i].class === 'spacer') {
          html += '<i class="spacer"></i>';
        } else {
          html += '<i class="fa fa-' + this.options.toolbarConfig[i].class + '" data-command="' + this.options.toolbarConfig[i].command + '" title="' + this.options.lang[this.options.toolbarConfig[i].command] + '"></i>';
        }
      }
    }

    html += '</div></div><div class="dropdown"><div class="arrow"></div><div class="inner"></div></div>';
    html += '<input type="file" id="file' + this.iframeId + '" multiple style="display:none">';
    return html;
  };

  zmEditor.prototype.adaptSize = function() {
    var height = document.getElementById(this.options.id).clientHeight;
    var iframeHeight = height - 28;
    document.getElementById(this.iframeId).setAttribute('height', iframeHeight);
  };

  zmEditor.prototype.dropHandler = function(e) {
    var dt = e.dataTransfer;
    var files = dt.files;
    if (files && files.length > 0) {
      this.uploadFiles(dt.files);
      e.stopPropagation();
      e.preventDefault();
    }
    this.hideDropTarget();
  };

  zmEditor.prototype.buttonClickHandler = function(element) {
    if (element) {
      var command = element.target.dataset.command;
      switch (command) {
        case 'table':
          var tableHtml = '<table style="border-collapse: collapse;" border="1" width="100%"><thead><tr><th>1</th><th>2</th></tr></thead><tbody><tr><td>3</td><td>4</td></tr></tbody></table><p>&nbsp;</p>';
          this.getContentDocument().execCommand('insertHTML', false, tableHtml);
          break;
        case 'heading':
          this.getContentDocument().execCommand(command, false, 'h1');
          break;
        case 'save':
          this.save(element.target);
          break;
        case 'attach':
          this.attach(element.target);
          break;
        case 'createLink':
        case 'insertImage':
          var src = window.prompt('Type Image Url here:');
          if (src) {
            this.getContentDocument().execCommand(command, false, src);
          }
          break;
        default:
          this.getContentDocument().execCommand(command, false);
      }
    }

  };

  zmEditor.prototype.enableEditing = function() {
    this.adaptSize();

    this.getContentDocument().designMode = "on";


    document.getElementById(this.iframeId).contentWindow.focus();

    var d = this.getContentDocument();
        d.execCommand('insertHTML', false, this.initHtml);


    var buttons = document.getElementsByClassName('fa');
    for (var i= 0, l = buttons.length; i < l; i++) {
      if (buttons.hasOwnProperty(i)) {
        var button = buttons[i];
        if (this && typeof this.buttonClickHandler === 'function') {
          var f = this.buttonClickHandler.bind(this);
          button.addEventListener('click', f, false);
        }
      }
    }

    var t = this;
    var fileInputChangedHandler = function(e) {
      t.uploadFiles(this.files);
      e.preventDefault();
    };

    document.getElementById('file' + this.iframeId).addEventListener('change', fileInputChangedHandler, false);

    this.getContentDocument().addEventListener('dragenter', this.showDropTarget.bind(this), false);

    this.getContentDocument().addEventListener('dragover', this.showDropTarget.bind(this), false);

    this.getContentDocument().addEventListener('dragleave', this.hideDropTarget.bind(this), false);

    this.getContentDocument().addEventListener('drop', this.dropHandler.bind(this), false);
  };


  zmEditor.prototype.attach = function() {
    document.getElementById('file' + this.iframeId).click();
  };

  zmEditor.prototype.uploadFiles = function(files) {
    if (files && files.length > 0) {
      for (var i = 0, l = files.length; i < l; i++) {
        this.uploadFile(files[i]);
      }
    }
  };


  function ZmFileUploader(url, file, callback) {
    var fu = this;
    fu.id = 'uploader' + Math.random().toString().replace('0.', '');

    console.log(file.constructor.name)

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

    // Retry uploading
    document.getElementById('rt' + fu.id).addEventListener('click', function() {
      fu.xhr.abort();
      fu.xhr = fu.uploadFile(file);
      document.getElementById('rt' + fu.id).style.visibility = 'hidden';
    });
    // Cancel uploading
    document.getElementById('cn' + fu.id).addEventListener('click', function() {
      fu.xhr.abort();
      document.getElementById('uploads').removeChild(uploadContainer);
    });


    fu.updateUploadPercentage = function(file, percent) {
      //console.timeStamp(percent);
      document.getElementById('pp' + fu.id).style.width = percent + '%';
    };

    fu.uploadFileFail = function() {
      //console.timeStamp('fail');
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
      xhr.addEventListener('load', function() {
        if (xhr.status === 200) {
          fu.uploadFileDone(xhr.response);
        } else {
          fu.uploadFileFail();
        }

      }, false);
      xhr.addEventListener('error', fu.uploadFileFail, false);
      xhr.open('POST', url);
      xhr.responseType= 'json';
      xhr.send(formData);
      return xhr;
    };

    fu.xhr = fu.uploadFile(file);
  }

  zmEditor.prototype.uploadFileDone = function(results) {
    for (var i in results) {
      if (results.hasOwnProperty(i)) {
        var result = results[i];
        switch (result.type) {
          case 'image/png':
          case 'image/gif':
          case 'image/jpg':
          case 'image/jpeg':
          case 'image/pjpeg':
            this.getContentDocument()
                .execCommand('insertImage', false, result.url);
            break;
          default:
            var html = '<a href="' + result.url + '" target="_blank">' +
                result.name + '</a>&nbsp;';
            this.getContentDocument().execCommand('insertHTML', false, html);
        }
      }
    }
  };

  zmEditor.prototype.uploadFile = function(file, done) {
    var uploader = new ZmFileUploader(this.options.uploadUrl, file, done || this.uploadFileDone.bind(this));
  };


  zmEditor.prototype.save = function(html, done) {
    var uploader = new ZmFileUploader(this.options.uploadUrl, new File(
        [this.getContentDocument().documentElement.outerHTML],
        'document.html',
        {type: 'text/html'}
    ), done || this.uploadFileDone.bind(this));
  };


  window.ZmHtmlEditor = zmEditor;

}());