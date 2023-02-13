# Express

## 1. Express App Object 생성

```js
import express from 'express';
const app = express();
app.listen(8080);
```

## 2. HTTP Request Method

- C (Create): POST

```js
app.post('/', (req, res) => {
  ...
});
```

- R (Read): GET

```js
app.get('/', (req, res) => {
  ...
});
```

- U (Update): PUT

```js
app.put('/', (req, res) => {
  ...
});
```

- D (Delete): DELET

```js
app.delete('/', (req, res) => {
  ...
});
```

## 3. Request, Response Object

- Request Object

```js
app.post('/:param', (req, res) => {
  const {
    headers, // 요청 헤더 정보
    query, // 쿼리 스트링 Object
    params, // URL 파라미터
    body // Request Body (JSON, Form Data)
  } = req;

  res.sendStatus(200);
});
```

- Response Object

```js
app.post('/', (req, res) => {
  res.setHeader('Content-Type', 'application/json'); // 응답 헤더 설정
  const headers = res.getHeaders(); // 응답 헤더 정보

  res.status(200); // 응답 상태 코드 설정

  /** 응답 (Handler 하나 당 아래 응답 방법 중 하나만 사용 가능) */
  res.sendStatus(200); // 1. 상태 코드만 응답
  res.send(`<h1>Hello World !!</h1>`); // 2. 텍스트 or 바이너리 데이터 전송
  res.json({ result: true, msg: 'SUCCESS' }); // 3. JSON 오브젝트 전송
});
```

## 4. 미들웨어

```js
import express from 'express';

const app = express();

app.use(express.json()); // Request Body 파싱
app.use(express.urlencoded({ extended: false })); // Form Data 파싱
app.use((req, res, next) => {
  const { query, params, body } = req;
  console.log({ query, params, body });
  next();
});

app.get('/', (req, res) => {
  ...
});

app.listen(8080);
```

## 5. 라우터

```js
import express from 'express';

const app = express();
const routerV1 = express.Router();
const routerV2 = express.Router();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/api/v1', routerV1);
app.use('/api/v2', routerV2);

/** /api/v1/test */
routerV1.get('/test', (req, res) => {
  res.json({ version: 'v1', result: 'Hello 1' });
});

/** /api/v2/test */
routerV2.get('/test', (req, res) => {
  res.json({ version: 'v2', result: 'Hello 2' });
});

app.listen(8080);
...

app.listen(8080);
```

## 6. Node HTTP 서버로 실행

```js
import express from 'express';
import http from 'http';

const app = express();
const server = http.createServer(app);

...

server.listen(8080);
```
