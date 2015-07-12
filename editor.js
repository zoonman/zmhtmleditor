/**
 * Created by zoonman on 1/2/15.
 */
(function () {
  'use strict';

  var zmEditorProto = function(setupOptions) {
    this.init(setupOptions);
  };

  zmEditorProto.prototype.randomId = function(prefix) {
    prefix = prefix || '';
    return prefix + Math.random().toString().replace('0.', '');
  };

  zmEditorProto.prototype.init = function(setupOptions) {
    var options = setupOptions || {};

    var defaultOptions = {
        locale: 'en-US',
        lang: {
          style: 'Style',
          bold: 'Bold',
          italic: 'Italic',
          underline: 'Underline',
          strikeThrough: 'Strike Through',
          createLink: 'Link',
          insertImage: 'Image',
          heading: 'Insert Header',
          insertParagraph: 'Paragraph',
          table: 'Insert 2x2 Table',
          addRowBelow: 'Add Row Below',
          addRowAbove: 'Add Row Above',
          addColumnBefore: 'Insert Column Left',
          addColumnAfter: 'Insert Column Right',
          deleteCurrentRow: 'Delete Row',
          deleteCurrentColumn: 'Delete Column',
          deleteTable: 'Delete Table',
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
          recognition: 'Voice Recognition (experimental)',
          h1:'Header 1',
          h2:'Header 2',
          h3:'Header 3',
          h4:'Header 4',
          h5:'Header 5',
          h6:'Header 6',
          pre:'Preformatted',
          blockquote:'Blockquote',
          paragraph:'Normal'
        },
        toolbarConfig: [
          {
            class: 'fa fa-header combo', command: 'style',
            menu: [
              {class: 'h1', command: 'h1', tag: 'h1'},
              {class: 'h2', command: 'h2', tag: 'h2'},
              {class: 'h3', command: 'h3', tag: 'h3'},
              {class: 'h4', command: 'h4', tag: 'h4'},
              {class: 'h5', command: 'h5', tag: 'h5'},
              {class: 'h6', command: 'h6', tag: 'h6'},
              {class: 'pre', command: 'pre', tag: 'pre'},
              {class: 'blockquote', command: 'blockquote', tag: 'blockquote'},
              {class: 'p', command: 'insertParagraph', tag: 'p'}
            ]

          },
          {class: 'bold', command: 'bold'},
          {class: 'italic', command: 'italic'},
          {class: 'underline', command: 'underline'},
          {class: 'strikethrough', command: 'strikeThrough'},
          {class: 'spacer'},
          {class: 'link', command: 'createLink'},
          {class: 'image', command: 'insertImage'
          },
          {class: 'fa fa-table', command: 'table',
            menu: [
              {class: 'table', command: 'table', tag: 'p'},
              {class: 'table', command: 'addRowAbove', tag: 'p'},
              {class: 'table', command: 'addRowBelow', tag: 'p'},
              {class: 'table', command: 'addColumnBefore', tag: 'p'},
              {class: 'table', command: 'addColumnAfter', tag: 'p'},
              {class: 'table', command: 'deleteCurrentRow', tag: 'p'},
              {class: 'table', command: 'deleteCurrentColumn', tag: 'p'},
              {class: 'table', command: 'deleteTable', tag: 'p'}
            ]},
          {class: 'spacer'},
          //{class: 'header', command: 'heading'},
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
          {class: 'paperclip', command: 'attach'},
          {class: 'thumb-tack pull-right', command: 'pinIt'},
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
      speechRecognitionEngine = window.SpeechRecognition;
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

  zmEditorProto.prototype.getIframe = function() {
    return document.getElementById(this.iframeId);
  };

  zmEditorProto.prototype.getContentDocument = function() {
    return this.getIframe().contentDocument;
  };

  zmEditorProto.prototype.setFocus = function() {
    var win = this.getIframe().contentWindow || this.getIframe().contentDocument.defaultView;
    var doc = win.document;
    if (win.getSelection && doc.createRange) {
      var sel = win.getSelection();
      var range = doc.createRange();
      range.selectNodeContents(doc.body);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
    } else if (doc.selection && doc.body.createTextRange) {
      var textRange = doc.body.createTextRange();
      textRange.collapse(true);
      textRange.select();
    }
  };

  zmEditorProto.prototype.showDropTarget = function() {
    document.getElementById('toolbar' + this.iframeId).style.opacity = 0.5;
  };

  zmEditorProto.prototype.hideDropTarget = function() {
    document.getElementById('toolbar' + this.iframeId).style.opacity = 1;
  };

  zmEditorProto.prototype.getPopupWindow = function() {
    return document.getElementById('popup' + this.iframeId);
  };

  zmEditorProto.prototype.setPopupText = function(text) {
    if (text) {
      document.getElementById('popupText' + this.iframeId).innerHTML = text;
    }
  };

  function tag(tagName, content, classAttr) {
    if (classAttr) {
      classAttr = ' class="' + classAttr + '"';
    }
    return '<' + tagName + classAttr  + '>' + content + '</'+ tagName +'>';
  }

  function div(content, classAttr) {
    if (classAttr) {
     classAttr = ' class="' + classAttr + '"';
    }
    return '<div' + classAttr  + '>' + content + '</div>';
  }


  zmEditorProto.prototype.getCaretPosition = function () {
    var caretOffset = 0;
    var doc = this.getContentDocument();
    var element = doc;
    var win = doc.defaultView || doc.parentWindow;
    var sel;
    if (typeof win.getSelection !== "undefined") {
      sel = win.getSelection();
      if (sel.rangeCount > 0) {
        var range = win.getSelection().getRangeAt(0);
        var preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(element);
        preCaretRange.setEnd(range.endContainer, range.endOffset);
        caretOffset = preCaretRange.toString().length;
      }
    } else if ( (sel = doc.selection) && sel.type !== "Control") {
      var textRange = sel.createRange();
      var preCaretTextRange = doc.body.createTextRange();
      preCaretTextRange.moveToElementText(element);
      preCaretTextRange.setEndPoint("EndToEnd", textRange);
      caretOffset = preCaretTextRange.text.length;
    }
    return caretOffset;
  };

  zmEditorProto.prototype.setCaretPosition = function(position) {
    this.setFocus();
    var internalDocument = this.getContentDocument();
    var el = internalDocument.getElementsByTagName('body')[0];
    if (typeof window.getSelection !== "undefined" &&
        typeof document.createRange !== "undefined") {
      var range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(false);
      range.setStart(internalDocument, position);
      range.setEnd(internalDocument, position);
      var sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    } else if (typeof document.body.createTextRange !== "undefined") {
      var textRange = document.body.createTextRange();
      textRange.moveToElementText(el);
      textRange.collapse(false);
      textRange.select();
    }
  };

  zmEditorProto.prototype.buildCommandTag = function(command, classAttr, tag) {
    var ctag = tag || 'i';
    var html = '';
    html += '<' + ctag + ' class="' + classAttr + ' command"';
    html += ' data-command="' + command + '"';
    html += ' id="cmd' + this.iframeId + command + '"';
    html += 'title="' + this.options.lang[command] + '">';
    if (tag) {
      html += this.options.lang[command];
    }
    html += '</' + ctag + '>';
    return html;
  };

  zmEditorProto.prototype.getSelectionStart = function() {
    var node = this.getContentDocument().getSelection().anchorNode;
    return (node.nodeType == 3 ? node.parentNode : node);
  };

  function getSpecifiedElement(node, tagName) {
    if (tagName) {
      if (node) {
        if (node.nodeName === tagName) {
          return node;
        } else {
          return getSpecifiedElement(node.parentNode, tagName);
        }
      }
    }
    return null;
  }

  zmEditorProto.prototype.getElementUnderCaret = function(tagName) {
    var node = this.getSelectionStart();
    //console.log(node);
    if (node) {
      if (tagName) {
        return getSpecifiedElement(node, tagName);
      } else {
        return node;
      }
    } else {
      return null;
    }
  };

  zmEditorProto.prototype.insertColumn = function(position) {
    var table = this.getElementUnderCaret('TABLE');
    if (table) {
      var tHead = table.tHead;
      for (var h = 0; h < tHead.rows.length; h++) {
        var newTh = document.createElement('th');
        tHead.rows[h].appendChild(newTh);
      }
      var tBody = table.tBodies[0];
      for (var i = 0; i < tBody.rows.length; i++) {
        var newCell = tBody.rows[i].insertCell(-1);
      }
    }
  };

  zmEditorProto.prototype.insertRow = function(position) {
    var table = this.getElementUnderCaret('TABLE');
    if (table) {
      // table
    }
  };

  zmEditorProto.prototype.dropColumn = function() {
    var node = this.getElementUnderCaret('TD');
    if (!node) {
      node = this.getElementUnderCaret('TH');
    }
    if (node) {
      var currentColumn = node.cellIndex;
      var table = this.getElementUnderCaret('TABLE');
      var allRows = table.rows;
      for (var i=0; i<allRows.length; i++) {
        if (allRows[i].cells.length > 1) {
          allRows[i].deleteCell(currentColumn);
        }
      }
    }
  };

  zmEditorProto.prototype.dropRow = function() {
    var node = this.getElementUnderCaret('TR');
    if (node) {
      node.parentNode.removeChild(node);
    }
  };

  zmEditorProto.prototype.dropTable = function() {
    var node = this.getElementUnderCaret('TABLE');
    if (node) {
      node.parentNode.removeChild(node);
    }
  };

  zmEditorProto.prototype.buildCommandList = function(commandList) {
    var html = '';
    for (var i in commandList) {
      if (commandList.hasOwnProperty(i)) {
        if (commandList[i].hasOwnProperty('menu')) {
          html += tag('i', div(this.buildCommandList(commandList[i].menu), 'dd'), commandList[i].class + ' combo');
        } else {
          if (commandList[i].class === 'spacer') {
            html += tag('i', '', 'spacer');
          } else {
              if (commandList[i].tag) {
                html += this.buildCommandTag(commandList[i].command, ' ' + commandList[i].class, commandList[i].tag);
              } else {
                html += this.buildCommandTag(commandList[i].command, 'fa fa-' + commandList[i].class);
              }
          }
        }
      }
    }
    return html;
  };

  zmEditorProto.prototype.generateToolbarHtml = function() {
    var html ='<div class="toolbar" id="toolbar' + this.iframeId + '"><div class="middle">';
    html += this.buildCommandList(this.options.toolbarConfig);
    html += '</div></div><div class="dropdown"><div class="arrow"></div><div class="inner"></div></div>';
    html += '<input type="file" id="file' + this.iframeId + '" multiple style="display:none">';
    html += '<div id="popup' + this.iframeId + '" class="popup"><i class="fa fa-2x fa-microphone"></i><span id="popupText' + this.iframeId + '"></span></div>';
    return html;
  };

  zmEditorProto.prototype.adaptSize = function() {
    var height = document.getElementById(this.options.id).clientHeight;
    var iframeHeight = height - 28;
    return this.getIframe().setAttribute('height', iframeHeight);
  };

  zmEditorProto.prototype.dropHandler = function(e) {
    var dt = e.dataTransfer;
    var files = dt.files;
    if (files && files.length > 0) {
      this.uploadFiles(dt.files);
      e.stopPropagation();
      e.preventDefault();
    }
    this.hideDropTarget();
  };

  zmEditorProto.prototype.buttonClickHandler = function(clickEvent) {
    if (clickEvent) {
      clickEvent.preventDefault();
      clickEvent.stopPropagation();

      var command = clickEvent.target.dataset.command;
      switch (command) {
        case 'table':
          var tableHtml = '<table style="border-collapse: collapse;" border="1" width="100%"><thead><tr><th>1</th><th>2</th></tr></thead><tbody><tr><td>3</td><td>4</td></tr></tbody></table><p>&nbsp;</p>';
          this.getContentDocument().execCommand('insertHTML', false, tableHtml);
          break;
        case 'h1':
        case 'h2':
        case 'h3':
        case 'h4':
        case 'h5':
        case 'h6':
          this.getContentDocument().execCommand('heading', false, command);
          break;

        case 'deleteCurrentColumn':
          this.dropColumn();
          break;
        case 'deleteCurrentRow':
          this.dropRow();
          break;
        case 'deleteTable':
          this.dropTable();
          break;
        case 'pre':
        case 'blockquote':
          this.getContentDocument().execCommand('formatBlock', false, command);
          break;
        case 'save':
          this.save(clickEvent.target);
          break;
        case 'attach':
        case 'insertImage':
          this.attach(clickEvent.target);
          break;
        case 'recognition':
          this.switchSpeechRecognition(clickEvent.target);
          break;
        case 'createLink':
          var src = window.prompt('Type Image Url here:');
          if (src) {
            this.getContentDocument().execCommand(command, false, src);
          }
          break;
        case  'addRowAbove':
            //
          break;
        case 'addRowBelow':
              //
          break;
        case 'addColumnBefore':
            //
          break;
        case 'addColumnAfter':
            //
          break;
        case 'dropCurrentRow':
          //
          break;

        case 'dropCurrentColumn':

          break;
        default:
          this.getContentDocument().execCommand(command, false);
      }
    }

  };

  zmEditorProto.prototype.enableEditing = function() {
    this.adaptSize();

    this.getIframe().focus();

    this.getContentDocument().designMode = "on";


    //this.getIframe().contentWindow.focus();

    var contentDocument = this.getContentDocument();
        contentDocument.execCommand('insertHTML', false, this.initHtml);


    var buttons = document.getElementsByClassName('command');
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

    window.setTimeout(function() {
      this.setFocus();
    }.bind(this), 100);
  };

  zmEditorProto.prototype.saveDocument = function() {
    if (this.saved || this.saving) {
      // gray out save icon on toolbar
      document.getElementById('cmd' + this.iframeId + 'save').style.color = 'gray';
    } else {
      this.saving = true;
      this.save('', this.documentSaved.bind(this));
      // update toolbar
      document.getElementById('cmd' + this.iframeId + 'save').style.color = 'blue';
    }
  };

  zmEditorProto.prototype.documentSaved = function() {
    this.saved = true;
    this.saving = false;
    // update toolbar
    document.getElementById('cmd' + this.iframeId + 'save').style.color = 'gray';

  };

  zmEditorProto.prototype.keydownHandler = function (event) {
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
    } else {
      var p = this.getCaretPosition();
      console.log(p);
    }
    if (! (event.ctrlKey || event.metaKey || event.altKey)) {
      this.saved = false;
      document.getElementById('cmd' + this.iframeId + 'save').style.color = '';
    }
  };

  zmEditorProto.prototype.speechRecognitionErrorHandler = function (err) {
    console.log(event.error);
    if (event.error) {
      this.setPopupText(event.error).bind(this);
    }
  };

  zmEditorProto.prototype.speechRecognitionSoundStart = function (data) {    console.log(data);  };
  zmEditorProto.prototype.speechRecognitionSoundEnd = function (data) {    console.log(data);  };
  zmEditorProto.prototype.speechRecognitionSpeechStart = function (data) {    console.log(data);  };
  zmEditorProto.prototype.speechRecognitionSpeechEnd = function (data) {    console.log(data);  };
  zmEditorProto.prototype.speechRecognitionAudioStart = function (data) {    console.log(data);  };
  zmEditorProto.prototype.speechRecognitionAudioEnd = function (data) {    console.log(data);  };
  zmEditorProto.prototype.speechRecognitionNoMatch = function (data) {    console.log(data);  };

  zmEditorProto.prototype.speechRecognitionEnd = function (data) {
    console.log(data);
    this.recognizing = false;
    this.getMicrophoneButton().classList.remove('recognizing');
    this.getPopupWindow().classList.remove('active');
    this.setPopupText('');

  };

  zmEditorProto.prototype.speechRecognitionResult = function (event) {
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

  zmEditorProto.prototype.speechRecognitionStart = function (data) {
    this.recognizing = true;
    this.getMicrophoneButton().classList.add('recognizing');
    this.setPopupText('');
    this.getPopupWindow().classList.add('active');
  };

  zmEditorProto.prototype.switchSpeechRecognition = function(el) {
    if (this.recognizing) {
      //this.recognizing = false;
      this.recognition.stop();
    } else {
      // this.recognizing = true;
      this.recognition.lang = this.options.locale;
      this.recognition.start();
    }
  };

  zmEditorProto.prototype.getMicrophoneButton = function() {
    var mic = document.getElementsByClassName('fa-microphone');
    if (mic.length > 0) {
      return mic[0];
    }
    return null;
  };

  zmEditorProto.prototype.attach = function() {
    document.getElementById('file' + this.iframeId).click();
  };

  zmEditorProto.prototype.uploadFiles = function(files) {
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

  zmEditorProto.prototype.uploadFileDone = function(results) {
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

  zmEditorProto.prototype.uploadFile = function(file, done) {
    var uploader = new ZmFileUploader(this.options.uploadUrl, file, done || this.uploadFileDone.bind(this));
  };


  zmEditorProto.prototype.save = function(html, done) {
    var xhr = new XMLHttpRequest();
    var formData = new FormData();
    formData.append('file', this.getContentDocument().documentElement.outerHTML );
    formData.append('caretPosition', this.getCaretPosition() );
    xhr.addEventListener('load', function() {
      if (xhr.status === 200) {
        done();
      } else {
        done();
      }
    }, false);
    xhr.open('POST', this.options.uploadUrl);
    xhr.responseType= 'json';
    xhr.send(formData);
    return xhr;
  };

  // extending global window namespace
  window.ZmHtmlEditor = zmEditorProto;

}());
