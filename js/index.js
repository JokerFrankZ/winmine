function Mine(tr, td, mineNum) {
  this.tr = tr // 行数
  this.td = td // 列数
  this.mineNum = mineNum // 雷的数量
  this.squares = [] // 是个二维数组，存储方格的信息（坐标，格子类型）
  this.tdDoms = [] // 存储所有的方格DOM元素（二维数组）
  this.surplusMine = mineNum // 剩余的雷数
  this.surplusMineDom = document.querySelector('.mine-num') // 剩余雷数的DOM
  this.isAllRight = false // 右键标的旗帜是否全是雷，判断玩家是否胜利
  this.parent = document.querySelector('.game-box') // 父级
}

// 初始化扫雷区域
Mine.prototype.init = function () {
  let randomMines = mine.randomNum(), // 这是随机的雷
    n = 0 // 这是方格的索引，因为i和j都不能达到表格格子数
  for (let i = 0; i < this.tr; i++) {
    this.squares[i] = []
    for (let j = 0; j < this.td; j++) {
      // 判断有雷的索引和表格的索引值是否一致，true为雷，false为数字
      if (randomMines.indexOf(n) != -1) {
        // 因为表格的行列的索引和坐标的索引是刚好相反的，而要存储的信息是坐标的数据，所以要反过来赋值
        // 行列第一行第二列（0，1），坐标X，Y（1，0）
        this.squares[i][j] = {
          type: 'mine', // 方格的类型
          x: j, // 方格的坐标
          y: i,
        }
      } else {
        this.squares[i][j] = {
          type: 'number',
          x: j,
          y: i,
          value: 0, // 代表数字的值，初始为零
        }
      }
      n++ // 确保0也可以判断进去
    }
  }
  mine.updateNum() // 更新数字
  mine.createDom() // 创建游戏表格

  // 禁用右键菜单
  document.addEventListener('contextmenu', function (ev) {
    ev = event || window.event
    ev.returnValue = false // 右键时返回false
    // return false 用句柄的方式绑定事件时可以通过这个方法来组织菜单
  })
  // 一开始的剩余雷数
  this.surplusMineDom.innerHTML = this.surplusMine
}

// 创建游戏方格
Mine.prototype.createDom = function () {
  let table = document.createElement('table') // 创建表格
  // 循环创建行
  for (let i = 0; i < this.tr; i++) {
    let trDom = document.createElement('tr') // 创建行
    this.tdDoms[i] = trDom // 将行的DOM元素存入数组
    //循环创建列
    for (let j = 0; j < this.td; j++) {
      let tdDom = document.createElement('td') // 创建列
      this.tdDoms[i][j] = tdDom // 将列的DOM元素存入数组
      tdDom.pos = [i, j] // 这个tdDom的行列坐标，用于从mine.squares里取
      tdDom.addEventListener('mousedown', play) // 监听鼠标事件
      trDom.appendChild(tdDom) // 将列添加到行里
    }
    table.appendChild(trDom) // 将行添加到表格
  }
  this.parent.innerHTML = '' // 避免多次点击切换难度按钮，出现多个表格
  this.parent.appendChild(table) // 将表格添加到父级盒子，即添加到页面中
}
// 鼠标左键单击执行的函数
function play() {
  mine.play(event, this)
}
// 按照雷的个数随机生成地雷
Mine.prototype.randomNum = function () {
  let squares = new Array(this.td * this.tr) // 创建一个和表格一样大小的空数组
  // 循环的向数组中添加数字
  for (let i = 0; i < squares.length; i++) {
    squares[i] = i
  }
  // 对数组进行随机排序
  squares.sort(function () {
    return 0.5 - Math.random()
  })
  // 截取前雷的个数的数字
  squares = squares.splice(0, this.mineNum)
  return squares
}

// 找雷附近的8个格子，参数为一个格子
Mine.prototype.getAround = function (square) {
  let x = square.x, // 格子的x坐标
    y = square.y, // 格子的y坐标
    result = [] // 周围的格子的坐标集合（二维数组）
  /**
   * 九个格子的坐标
   * (x-1,y-1) (x,y-1) (x+1,y-1)
   * (x-1,y)   (x,y)   (x+1,y)
   * (x-1,y+1) (x,y+1) (x+1,y+1)
   */
  // 循环这9个坐标
  for (let i = x - 1; i <= x + 1; i++) {
    for (let j = y - 1; j <= y + 1; j++) {
      // 排除不需要的格子的坐标
      if (
        i < 0 || // 排除超出左边的格子
        j < 0 || // 排除超出上边的格子
        i > this.td - 1 || // 排除超出右边的格子
        j > this.tr - 1 || // 排除超出下边的格子
        (i == x && j == y) || // 排除自己
        // 注意，此处要对比的是行与列的坐标，不是X，Y坐标，所以要互换
        this.squares[j][i].type == 'mine' // 排除周围是雷的格子
      ) {
        continue // 如果是以上的情况，跳过
      }
      // 要保存的是行列的坐标，不是XY的坐标，刚刚好相反
      result.push([j, i])
    }
  }
  return result
}

// 更新数字
Mine.prototype.updateNum = function () {
  // 把要更新的格子遍历出来
  for (let i = 0; i < this.tr; i++) {
    for (let j = 0; j < this.td; j++) {
      // 跳过所有为数字的格子，因为只有雷附近的格子才要更新
      if (this.squares[i][j].type == 'number') {
        continue
      }
      // 这个是为雷的格子的周围的格子
      let mineNum = this.getAround(this.squares[i][j])
      // 遍历这些格子，为他们的value加1
      for (let k = 0; k < mineNum.length; k++) {
        /**
         * mineNum[k] == [0,1] --> 这个是[X,Y]
         * mineNum[k][0] == 0  --> 这个是X
         * mineNum[k][1] == 1  --> 这个是Y
         */
        // 这里其实就是this.squares[x][y].value
        this.squares[mineNum[k][0]][mineNum[k][1]].value += 1
      }
    }
  }
}

let mask = document.querySelector('.mask'), // 遮罩层
  maskInfo = document.querySelector('.mask .info'),
  maskInfoTitle = document.querySelector('.mask .info h1')
// 开始游戏 传2个参数，第一个是event，第二个是哪个tdDom触发
Mine.prototype.play = function (ev, obj) {
  ev = event || window.event // 兼容ie浏览器
  // 因为嵌套了function，所以在function里面创建的function使用的this是指向它自己的，而需要的是指向Mine的this
  let _this = this
  // 点击左键时,当格子为旗子的时候，不能左键点击
  if (ev.which == 1 && obj.className != 'flag') {
    let currentSquare = this.squares[obj.pos[0]][obj.pos[1]], // 当前点击的方格
      classN = [
        'zero',
        'one',
        'two',
        'three',
        'four',
        'five',
        'six',
        'seven',
        'eight',
      ] // 数字的样式

    /*************************
     当点击的是旗子时，需要左键可以撤销
     if (obj.className == 'flag') {
      obj.className = '' // 撤掉旗子
      this.surplusMineDom.innerHTML = ++this.surplusMine // 加回雷数
      return
     }
     */

    // 点击的是数字
    if (currentSquare.type == 'number') {
      obj.innerHTML = currentSquare.value // 将数字赋值
      obj.className = classN[currentSquare.value] // 更改数字样式

      // 点到的数字是0
      if (currentSquare.value === 0) {
        obj.innerHTML = '' // 数字为零不显示
        getAllZero(currentSquare) // 以当前点击的格子来触发

        // 用递归的方式来找所有连成一片为0的格子
        function getAllZero(square) {
          let around = _this.getAround(square) // 周围的n个格子

          for (let i = 0; i < around.length; i++) {
            // around[i] == [1,0]
            let x = around[i][0], // 行
              y = around[i][1] // 列

            // 显示为0的格子
            // 前面为显示格子的DOM元素，后面是存储这个格子信息的value
            _this.tdDoms[x][y].className = classN[_this.squares[x][y].value]

            if (_this.squares[x][y].value == 0) {
              // 如果以某个格子为中心，找到的周围的格子还是为0，那就继续找（递归）
              if (!_this.tdDoms[x][y].check) {
                // 为了防止互相找为0的格子
                // 给对应的td添加一个属性，当该td被找过check则为true，反之则继续找
                _this.tdDoms[x][y].check = true
                // 以被找到的格子为中心继续找
                getAllZero(_this.squares[x][y])
              }
            } else {
              // 如果以某个格子为中心找到的周围格子值！=0，那就显示该格子对应的value
              _this.tdDoms[x][y].innerHTML = _this.squares[x][y].value
            }
          }
        }
      }
    } else {
      // 点到的是雷的时候
      this.gameOver(obj)
    }
  }
  // 点击的是右键
  if (ev.which == 3) {
    // 当右击的是数字的时候，不能添加旗子
    if (obj.className && obj.className != 'flag') {
      // 判断：当点击的td有class和class不为flag的时候就是数字
      return
    }
    // 判断被点击的td class是否为flag，当为true将class清空，否则加上‘flag’
    obj.className = obj.className == 'flag' ? '' : 'flag'

    // 剩余雷数的运算
    if (obj.className == 'flag') {
      // 右击是flag时，减少雷数
      this.surplusMineDom.innerHTML = --this.surplusMine
    } else {
      // 右击不是flag时，增加雷数
      this.surplusMineDom.innerHTML = ++this.surplusMine
    }
  }

  // 当雷等于0的时候，代表旗子插完了
  if (this.surplusMine == 0) {
    let flagSquare = [] // 存储旗子下面是雷的方格DOM
    // 循环遍历所有方格
    for (let i = 0; i < this.tr; i++) {
      for (let j = 0; j < this.td; j++) {
        // 筛选出是旗子的格子
        if (this.tdDoms[i][j].className == 'flag') {
          // 筛选出旗子下面是雷的格子
          if (this.squares[i][j].type == 'mine') {
            // 添加进数组
            flagSquare.push(this.tdDoms[i][j])
          }
        }
      }
    }
    // 判断旗子下面是雷的格子个数和雷的总数是不是一致
    this.isAllRight = flagSquare.length == this.mineNum ? true : false

    if (this.isAllRight) {
      this.gameOver()
      maskInfoTitle.innerHTML = '游戏胜利'
    } else {
      this.gameOver()
      maskInfoTitle.innerHTML = '游戏失败'
    }
  }
}

// 游戏结束
Mine.prototype.gameOver = function (obj) {
  /**
   * 1.显示所有的雷
   * 2.清除之前的鼠标事件
   * 3.标记当前点击的雷
   */
  for (let i = 0; i < this.tr; i++) {
    for (let j = 0; j < this.td; j++) {
      if (this.squares[i][j].type == 'mine') {
        this.tdDoms[i][j].className = 'mine'
      }
      // 移除事件监听
      this.tdDoms[i][j].removeEventListener('mousedown', play)
    }
  }
  // 如果有传参则运行
  if (obj) {
    obj.className = 'boom-mine' // 标记当前点击的雷
    maskInfoTitle.innerHTML = '游戏失败'
  }
  mask.style.zIndex = 2
  mask.style.opacity = 1
  setTimeout(function () {
    // 为了下一次还能显示动画，1秒后清除
    maskInfo.style.animation = 'none'
  }, 700)
  maskInfo.style.animation = 'show-info .7s'
}

// 切换游戏level
let btns = document.querySelectorAll('.level button'),
  mine = null, // 生成的实例
  active = 0, // 当前激活的状态
  arr = [
    [10, 10, 10],
    [17, 17, 40],
    [28, 28, 99],
  ],
  maskInfoBtn = document.querySelector('.mask .info button')

// 排除重置按钮
for (let i = 0; i < btns.length - 1; i++) {
  btns[i].onclick = function () {
    btns[active].className = ''
    this.className = 'active'

    // es6的扩展运算符和new Mine(9, 9, 10)的效果是一样的
    mine = new Mine(...arr[i])
    mine.init()
    active = i // 使用了let有块级作用域，不需要生成闭包来解决
  }
}
// 重置按钮
function reStart() {
  mine = new Mine(...arr[active])
  mine.init()
  mask.style.zIndex = -1
  mask.style.opacity = 0
  setTimeout(function () {
    // 为了下一次还能显示动画，1秒后清除
    maskInfo.style.animation = 'none'
  }, 1000)
  maskInfo.style.animation = 'hide-info 1s'
}
btns[3].addEventListener('click', reStart)
maskInfoBtn.addEventListener('click', reStart) // 遮罩层重新开始按钮

btns[0].onclick() // 初始化默认选择初级
