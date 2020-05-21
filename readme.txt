npm init
  npm install mongodb@2.2.33 --save
"dependencies": {
  "mongodb": "2.2.33"
}

  npm i prompt-confirm
  npm install -g pkg
Create .exe file for win x64:
  pkg server.js
Create .exe file for win x86:
  pkg server.js --targets=latest-win-x86

https://www.youtube.com/watch?v=lIpmtAs-wGk


Утиліта для автоматичної відправки команди Приписати.
Запускається на хості з РКОМом.
РКОМ та Монго повинні бути запущені.
Команда буде відправлена з періодом 60 секунд на прилади, які у момент запуску утиліти знаходилися на зв'язку та були відписані.
УВАГА! Пультова програма Дунай повинна бути запущена, інакше відповіді від приладів будуть накопичуватися у буфері РКОМу!
