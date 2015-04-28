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
          uploading: '',
          recognition: 'Voice Recognition (experimental)'
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

    var speechRecognitionEngine = null;
    if ('SpeechRecognition' in window) {
      speechRecognitionEngine = window['SpeechRecognition'];
    }
    if ('webkitSpeechRecognition' in window) {
      speechRecognitionEngine = window['webkitSpeechRecognition'];
    }
    if ('mozSpeechRecognition' in window) {
      speechRecognitionEngine = window['mozSpeechRecognition'];
    }

    if (speechRecognitionEngine) {
      this.recognition = new speechRecognitionEngine();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      defaultOptions.toolbarConfig.push({class: 'microphone', command: 'recognition'});
    } else {
      this.recognition = null;
    }


    this.options = extend(defaultOptions, options);
    this.iframeId = this.randomId('ZmEditor');
    this.initElement = document.getElementById(this.options.id);
    this.initHtml = this.initElement.innerHTML;
    this.saved = true;
    this.saving = false;

    this.initElement.className += ' ZmHtmlEditor';
    this.initElement.innerHTML = this.generateToolbarHtml() +
    '<iframe class="area" id="' + this.iframeId + '"><'+'/iframe>';

    this.recognizing = false; // speech recognition is disabled

    window.addEventListener('resize', this.adaptSize.bind(this), false);

    window.setTimeout( this.enableEditing.bind(this), 100);
    
  };

  zmEditor.prototype.getIframe = function() {
    return document.getElementById(this.iframeId);
  };

  zmEditor.prototype.getContentDocument = function() {
    return this.getIframe().contentDocument;
  };

  zmEditor.prototype.setFocus = function() {
    return this.getIframe().focus();
  };

  zmEditor.prototype.showDropTarget = function() {
    document.getElementById('toolbar' + this.iframeId).style.opacity = 0.5;
  };

  zmEditor.prototype.hideDropTarget = function() {
    document.getElementById('toolbar' + this.iframeId).style.opacity = 1;
  };

  zmEditor.prototype.getPopupWindow = function() {
    return document.getElementById('popup' + this.iframeId);
  };

  zmEditor.prototype.setPopupText = function(text) {
    if (text) {
      return document.getElementById('popupText' + this.iframeId).innerHTML = text;
    }
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
    html += '<div id="popup' + this.iframeId + '" class="popup"><i class="fa fa-2x fa-microphone"></i><span id="popupText' + this.iframeId + '"></span></div>';
    return html;
  };

  zmEditor.prototype.adaptSize = function() {
    var height = document.getElementById(this.options.id).clientHeight;
    var iframeHeight = height - 28;
    return this.getIframe().setAttribute('height', iframeHeight);
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
        case 'insertImage':
          this.attach(element.target);
          break;
        case 'recognition':
          this.switchSpeechRecognition(element.target);
          break;
        case 'createLink':
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


    this.getIframe().contentWindow.focus();

    var contentDocument = this.getContentDocument();
        contentDocument.execCommand('insertHTML', false, this.initHtml);


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

    if (this.recognition) {
      this.recognition.addEventListener('start', this.speechRecognitionStart.bind(this), false);
      this.recognition.addEventListener('end', this.speechRecognitionEnd.bind(this), false);
      this.recognition.addEventListener('result', this.speechRecognitionResult.bind(this), false);
      this.recognition.addEventListener('nomatch', this.speechRecognitionNoMatch.bind(this), false);
      this.recognition.addEventListener('error', this.speechRecognitionErrorHandler.bind(this), false);
      this.recognition.addEventListener('soundstart', this.speechRecognitionSoundStart.bind(this), false);
      this.recognition.addEventListener('soundend', this.speechRecognitionSoundEnd.bind(this), false);
      this.recognition.addEventListener('speechstart', this.speechRecognitionSpeechStart.bind(this), false);
      this.recognition.addEventListener('speechend', this.speechRecognitionSpeechEnd.bind(this), false);
      this.recognition.addEventListener('audiostart', this.speechRecognitionAudioStart.bind(this), false);
      this.recognition.addEventListener('audioend', this.speechRecognitionAudioEnd.bind(this), false);
    }

    document.getElementById('file' + this.iframeId).addEventListener('change', fileInputChangedHandler, false);

    contentDocument.addEventListener('dragenter', this.showDropTarget.bind(this), false);

    contentDocument.addEventListener('dragover', this.showDropTarget.bind(this), false);

    contentDocument.addEventListener('dragleave', this.hideDropTarget.bind(this), false);

    contentDocument.addEventListener('drop', this.dropHandler.bind(this), false);

    var heads = contentDocument.getElementsByTagName('head');
    if (this.options.customCssUrl && heads.length > 0) {
      var link = document.createElement("link");
      link.href = this.options.customCssUrl;
      link.type = "text/css";
      link.rel = "stylesheet";
      heads[0].appendChild(link);
    }

    contentDocument.addEventListener('keydown', this.keydownHandler.bind(this), false);
    window.setInterval(this.saveDocument.bind(this), 2718); // let's make check interval close to e
  };

  zmEditor.prototype.saveDocument = function() {
    if (this.saved || this.saving) {
      // gray out save icon on toolbar
    } else {
      this.saving = true;
      this.save('', this.documentSaved.bind(this));
      // update toolbar
    }
  };

  zmEditor.prototype.documentSaved = function() {
    this.saved = true;
    this.saving = false;
    // update toolbar
  };

  zmEditor.prototype.keydownHandler = function (event) {
    if (event.ctrlKey || event.metaKey) {
      switch (String.fromCharCode(event.which).toLowerCase()) {
        case 's':
          event.preventDefault();

          break;
        case 'f':
          event.preventDefault();
          // @done
          break;
        case 'b':
          event.preventDefault();
          this.getContentDocument().execCommand('bold', false);
          break;
        case 'i':
          event.preventDefault();
          this.getContentDocument().execCommand('italic', false);
          break;
        case 'u':
          event.preventDefault();
          this.getContentDocument().execCommand('underline', false);
          break;
        case 'g':
          event.preventDefault();
          // @done
          break;


      }
    }
    if (! (event.ctrlKey || event.metaKey || event.altKey)) {
      this.saved = false;
    }
  };

  zmEditor.prototype.speechRecognitionErrorHandler = function (err) {
    console.log(event.error);
    if (event.error == 'no-speech') {
      // @todo
    }
    if (event.error == 'audio-capture') {
      // @todo
    }
    if (event.error == 'not-allowed') {
      // @todo
    }
    if (event.error) {
      this.setPopupText(event.error).bind(this);
    }
  };

  zmEditor.prototype.speechRecognitionSoundStart = function (data) {    console.log(data);  };
  zmEditor.prototype.speechRecognitionSoundEnd = function (data) {    console.log(data);  };
  zmEditor.prototype.speechRecognitionSpeechStart = function (data) {    console.log(data);  };
  zmEditor.prototype.speechRecognitionSpeechEnd = function (data) {    console.log(data);  };
  zmEditor.prototype.speechRecognitionAudioStart = function (data) {    console.log(data);  };
  zmEditor.prototype.speechRecognitionAudioEnd = function (data) {    console.log(data);  };
  zmEditor.prototype.speechRecognitionNoMatch = function (data) {    console.log(data);  };

  zmEditor.prototype.speechRecognitionEnd = function (data) {
    console.log(data);
    this.recognizing = false;
    this.getMicrophoneButton().classList.remove('recognizing');
    this.getPopupWindow().classList.remove('active');
    this.setPopupText('');

  };

  zmEditor.prototype.speechRecognitionResult = function (event) {
    console.log(event);
    var final_transcript = '', interim_transcript = '';
    if (event.results) {
      for (var i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final_transcript += event.results[i][0].transcript;
        } else {
          interim_transcript += event.results[i][0].transcript;
          this.setPopupText(interim_transcript);
        }
      }

      if (final_transcript.length > 0) {
        this.setPopupText('');
        console.log(final_transcript);
        this.getContentDocument().execCommand('insertText', false, final_transcript + ' ');
        this.saved = false;
      }

    }
  };

  zmEditor.prototype.speechRecognitionStart = function (data) {
    this.recognizing = true;
    this.getMicrophoneButton().classList.add('recognizing');
    this.setPopupText('');
    this.getPopupWindow().classList.add('active');
  };

  zmEditor.prototype.switchSpeechRecognition = function(el) {
    if (this.recognizing) {
      //this.recognizing = false;
      this.recognition.stop();
    } else {
      // this.recognizing = true;
      this.recognition.lang = 'ru-RU';
      this.recognition.start();
    }
  };

  zmEditor.prototype.getMicrophoneButton = function() {
    var mic = document.getElementsByClassName('fa-microphone');
    if (mic.length > 0) {
      return mic[0];
    }
    return null;
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

    console.log(file.constructor.name);

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
            var html = ' <a href="' + result.url + '" target="_blank">' +
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

// extending global window namespace
  window.ZmHtmlEditor = zmEditor;

}());
