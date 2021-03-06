riot.tag2('contenttable', '<div id="contentTable"> <table> <tr> <th></th> <th>Play</th> <th>Text</th> <th>Start</th> <th>End</th> <th>Duration</th> </tr> <tr each="{phrase, phraseNum in Phrases.get()}" if="{phraseNum > 0}" class="{active : currentPhraseNum == phraseNum}"> <td class="num-in-table">{phraseNum}</td> <td class="play-in-table" onclick="{playInTable}">&nbsp;</td> <td class="table-phrase"> <input name="text" oninput="{onEditText}" value="{phrase.text}" class="original {pair : show_translation}"></input> <input show="{show_translation}" name="translation" oninput="{onEditTranslation}" class="translation {pair : show_translation}" value="{Phrases.getTranslation(phraseNum)}"></input> </td> <td class="table-timing"><input name="timingStart" step="0.1" value="{phrase.timingStart}" oninput="{onEditTimingStart}" type="{\'number\'}"></input></td> <td class="table-timing"><input name="timingEnd" step="0.1" value="{phrase.timingEnd}" oninput="{onEditTimingEnd}" type="{\'number\'}"></input></td> <td>{(phrase.timingEnd-phrase.timingStart).toFixed(2)}</td> </tr> </table> </div>', '', '', function(opts) {

    var tag = this

    tag.playInTable = function(event) {
      Media.playPhrase(event.item.phraseNum)
    }

    tag.onEditText = function(event) {
      Phrases.updatePhrase(event.item.phraseNum,{"text": this.text.value })
    }

    tag.onEditTranslation = function(event) {
      Phrases.updateTranslation(event.item.phraseNum, this.translation.value)
    }

    tag.onEditTimingStart = function(event) {
      Phrases.updatePhrase(event.item.phraseNum,{"timingStart": this.timingStart.value })
      Media.playPhrase(event.item.phraseNum)
    }

    tag.onEditTimingEnd = function(event) {
      Phrases.updatePhrase(event.item.phraseNum,{"timingEnd": this.timingEnd.value })
    }

    Phrases.on('updated', function() {
      tag.update()
    })

    Phrases.on("currentPhraseChanged", function(phraseNum){
        tag.currentPhraseNum = phraseNum
        tag.update()

      })

    Phrases.on("translation_language_changed", function(lang){
        if (lang) tag.show_translation = true
        else tag.show_translation = false
        console.log(Phrases.getTranslationLanguage())
        tag.update()
    })

    Phrases.on("translation_changed", function(){tag.update()})

}, '{ }');

riot.tag2('mediainputoutput', '<div id="mediaInput"> <p>Add link to media: <input placeholder="URL to media" name="link" oninput="{readLink}"></input> <span name="mediaType"> {mediaType}</span></p> <audio if="{mediaType==⁗audio⁗}" name="audioElement" controls="1" riot-src="{this.link.value}"></audio><br> <video if="{mediaType==⁗video⁗}" name="videoElement" controls="1" riot-src="{this.link.value}"></video><br> <div if="{mediaType==⁗youtube⁗}" id="player"></div> <playercontrols currentphrase="{this.currentPhraseNum}" subs-original="{this.subs_original}" subs-translation="{this.subs_translation}"></PlayerControls> </div>', '', '', function(opts) {

    var tag = this
    tag.mediaType = ""
    tag.currentPhraseNum = 1
    tag.subs_original = ""
    tag.subs_translation = ""

    tag.readLink = function() {

      tag.mediaType = Media.type(tag.link.value)
      if ( (tag.mediaType == 'audio') || (tag.mediaType == 'video') )
        Media.setMedia(tag[tag.mediaType + "Element"])
      if ( tag.mediaType == 'youtube')
        Youtube.loadYoutubeApi()

    }

    Phrases.on("currentPhraseChanged", function(phraseNum){

        tag.currentPhraseNum = phraseNum

        try {
          tag.subs_original = Phrases.getPhrase(phraseNum).text
          tag.subs_translation = Phrases.getTranslation(phraseNum)

        }
        catch(e){}

        tag.update()

      })

}, '{ }');

riot.tag2('playercontrols', '<div id="subtitles"> <div id="subs-original">{opts.subsOriginal}</div> <div id="subs-translation">{opts.subsTranslation}</div> </div> <button id="prevButton" class="playerNav" onclick="{prevClicked}" title="previous phrase">←</button> <button id="repeatButton" class="playerNav" onclick="{repeatClicked}" title="repeat phrase">↑</button> <button id="nextButton" class="playerNav" onclick="{nextClicked}" title="next phrase">→</button> <button onclick="{setTiming}" title="Add time interval">↵</button> <button class="playerNav" title="current phrase">{opts.currentphrase}/{Phrases.length()}</button> <input name="playbackRate" title="playback rate" class="playerNav" step="0.1" oninput="{playbackRateChanged}" value="1" type="number"></input>', '', '', function(opts) {

  var tag = this

      tag.nextClicked = function(){
        var cf = Phrases.getCurrentPhraseNum()
        Media.playPhrase(cf+1)
      }

      tag.prevClicked = function(){
        var cf = Phrases.getCurrentPhraseNum()
        Media.playPhrase(cf-1)
      }

      tag.repeatClicked = function(){
        var cf = Phrases.getCurrentPhraseNum()
        Media.playPhrase(cf)
      }

      tag.setTiming = function() {
        var curPhraseNum = Phrases.getCurrentPhraseNum()
        var prevPhrase = Phrases.getPhrase(curPhraseNum - 1)

            if(curPhraseNum > Phrases.length()) {
                Media.pause()
                Phrases.updatePhrase(curPhraseNum, {
                              timingStart:  prevPhrase.timingEnd,
                              timingEnd: Media.getCurrentTime().toFixed(2),
                              text: ""
                              })
            }

            else {
              Phrases.updatePhrase(curPhraseNum, {
                                "timingStart": prevPhrase.timingEnd,
                                "timingEnd": Media.getCurrentTime().toFixed(2)
                              })
            }
      }

      tag.playbackRateChanged = function(e){
        Media.setPlaybackRate(e.target.value)
      }

      Phrases.on("updated", function() {
        tag.update()
      })

}, '{ }');

riot.tag2('selectlanguage', '<select oninput="{onSelectLanguage}"> <option> </option> <option>ru</option> <option>en</option> <option>ar</option> </select>', '', '', function(opts) {
    tag = this

    tag.onSelectLanguage = function(e){
      if(opts.target=="original") Phrases.setLanguage(e.target.value)
      else if(opts.target=="translation") Phrases.setTranslationLanguage(e.target.value)
    }
}, '{ }');

riot.tag2('textanalyze', '<select onchange="{inputedTextAnalyze}"> <option></option> <option value="read_subs">Read subtitles (with timing)</option> <option value="read_lines">Read line by line (without timing)</option> <option value="read_words">Read text article (word by word)</option> </select>', '', '', function(opts) {

    var tag = this

    tag.inputedTextAnalyze = function(e) {
        if(e.target.value == "read_subs") tag.readSubtitles(opts.text)
        if(e.target.value == "read_lines") Phrases.readTextLineByLine(opts.text)
        if(e.target.value == "read_words") tag.readWordByWord(opts.text)

    }

    tag.readSubtitles = function(sub_text){

      sub_type = Subtitles.type(sub_text)
      if( (sub_type == "srt" ) || (sub_type == "webvtt" ) )
        Phrases.set(Subtitles.parseWebvttSrt(sub_text));
      else if(sub_type == "ass")
        Phrases.set(Subtitles.parseAss(text));
        console.log(sub_type)
    }

    tag.readWordByWord = function(text){

      Words.set(text.split(/\s/))

      if(Subtitles.languageDetector(text) == 'arabic') Words.setLang("arabic")

    }

}, '{ }');

riot.tag2('textinput', '<div id="textInput"> <textarea name="textinput" oninput="{inputEdit}" placeholder="Please, input text..."></textarea><br> <p>Choose action with inputted text: <textanalyze text="{this.textinput.value}"></TextAnalyze></p> <p>Choose source language: <selectlanguage target="original"></SelectLanguage></p> <p>Add translation: <selectlanguage target="translation"></SelectLanguage></p> <button onclick="{saveResults}">Save results</button> <button onclick="{restoreResults}">Restore from localStorage</button> </div>', '', '', function(opts) {
    var tag = this

    tag.inputEdit = function(){
      tag.update()
    }

    tag.saveResults = function(){
      Phrases.saveToLocalStorage(Media.getLink())
    }

    tag.restoreResults = function(){
      Phrases.restoreFromLocalStorage(Media.getLink())
    }

}, '{ }');

riot.tag2('textoutput', '<div name="text-output" id="textOutput" class="{arabic : Words.getLang()==⁗arabic⁗}"> <virtual each="{word, wordNum in Words.get()}"> <div class="word-block"> <div if="{word.trim()!=⁗⁗}" class="word {Words.getWordStatus(wordNum)}" onclick="{wordClicked}">{word} </div> </div> <br if="{word.trim()==⁗⁗}"> <br if="{word.trim()==⁗⁗}"> </virtual> </div>', '', '', function(opts) {

var tag = this

tag.wordClicked = function (event) {
  var prevPhrase = Phrases.getPhrase(Phrases.getCurrentPhraseNum() - 1)
  var word0 = (Words.getWord(prevPhrase.word1 + 1).trim() != "") ? prevPhrase.word1 + 1 : prevPhrase.word1 + 2

  Phrases.updatePhrase(Phrases.getCurrentPhraseNum(), {
                word0: word0,
                word1: event.item.wordNum,
                timingStart:  prevPhrase.timingEnd,
                timingEnd: Media.getCurrentTime().toFixed(2),
                text: Words.getPhraseFromWords(word0, event.item.wordNum+1)
                })

}

Words.on('words_updated', function() {
  tag.update()
})

}, '{ }');

riot.tag2('textsoriginaltranslation', '<textarea name="original"></textarea> <textarea name="translation"></textarea> <br> <button onclick="{readToPhrases}">Read to Phrases</button> <button onclick="{readFromPhrases}">Read from Phrases</button>', '', '', function(opts) {
    var tag = this
    tag.readFromPhrases = function(){

      tag.original.value = Phrases.phrasesToText("text")
      tag.translation.value = Phrases.translationsToText(Phrases.getTranslationLanguage())
      var tx_height = Phrases.length()*32.8 + "px"
      tag.original.style.height = tx_height
      tag.translation.style.height = tx_height
    }

    tag.readToPhrases = function(){
      Phrases.readTextLineByLine(tag.original.value)
      Phrases.readTranslationFromText(tag.translation.value)
    }

}, '{ }');
