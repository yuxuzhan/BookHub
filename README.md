# CSC309 Team 22 BookHub
BookHub is a website for UofT students to buy, sell or trade used textbooks for different courses. A seller will need to input book’s title, author, course code, price, short description, etc. and may choose to attach images. A buyer may search by course code or book’s title to find the corresponding textbooks. A buyer can also send email directly to the seller. A buyer can also review/rate the seller’s trustworthiness after purchasing from this seller.



## Run the web application
```
$ cd to the directory
$ npm install
$ mongod (open by another terminal)
$ node index.js
Enter localhost:3000/ in browser
```

## To run the Test Case
```
$ cd test
$ sh test.script.sh
Note:
The test only run the POST/PUT command since the Get will render html pages
```

## Project Structure:
The project is including in both Front-End and Back-end.
### Front-End File Included
The front-end is composed by following elements:
```
HTML: /views/ -> mainly using .ejs to generate html page

CSS: /public/css/

Javascript: /public/js

img: /public/img

user upload file: /public/uploads (name with timestamp)
```
In addition, credit to

- Front-End framework: [Bootstrap](http://getbootstrap.com/)

---
### Back-End File Included
```
Detail in package.json
```
---

### Developement Team
* Yuxuan Zhang
* Yanrong Wang
* Shaocong Cheng
* Erhao Chen
