import './App.css';

import home from'./components/home/home'
import publicDatapage from './components/ground/publicDatapage';
import privateDatapage from './components/ground/privateDatapage';
import shareMessage from './components/upload/shareMessage';
import detail from './components/detail/detail';
import personDetail from './components/upload/personDetail';

import React from 'react';
import './App.css';
import { BrowserRouter as Router, Link, Route, Switch } from 'react-router-dom'
import { Layout, Menu, Dropdown} from 'antd';
import {DownOutlined } from '@ant-design/icons';
import SubMenu from 'antd/lib/menu/SubMenu';

const {Content} = Layout;



class App extends React.Component {
  constructor(props){
    super(props);
    let pathofffix = window.location.pathname;
    console.log(window.location.pathname)
    let tstate = "home";
    switch(pathofffix){
      case '/':
        tstate = "home";
        break;
      case '/publicdata':
        tstate = 'publicdata';
        break;
      case '/privatedata':
        tstate = 'privatedata';
        break;
      case '/detail':
        tstate = 'publicdata';
        break;
      case '/personDetail':
        tstate = 'persondetail';
        break;
      default:
        break;
    }
    this.state = {
      currentPage:tstate
    };
  }
  //在componentDidMount生命周期中添加window的handleScroll滑动监听事件
  componentDidMount() {
    console.log('app componentDidMount');
    let pathofffix = window.location.pathname;
    console.log(window.location.pathname)
    let tstate = "home";
    switch(pathofffix){
      case '/':
        tstate = "home";
        break;
      case '/publicdata':
      case '/privatedata':
      case '/detail':
        tstate = 'shareground';
        break;
      case '/personDetail':
      case '/personDetail/':
      case '/personDetail/page1':
      case '/personDetail/page1/':
      case '/personDetail/page1/privatedata':
      case '/personDetail/page2':
        tstate = 'personDetail';
        break;
      default:
        break;
    }
    this.setState({
      currentPage: tstate
    })
  }
  // //定义handleScroll事件函数
  // handleScroll =(e)=>{
  //   var header = document.getElementById('header'); //定义一个dom节点为'header'的header变量
  //     if(window.pageYOffset >= 80){  //if语句判断window页面Y方向的位移是否大于或者等于导航栏的height像素值
  //       header.classList.add('header_bg');  //当Y方向位移大于80px时，定义的变量增加一个新的样式'header_bg'
  //     } else {
  //       header.classList.remove('header_bg'); //否则就移除'header_bg'样式
  //     }
  // }

  handleMenuClick = (e)=>{
    console.log('app handleMenuclick')
    console.log(e.key)
    this.setState({
      currentPage: e.key
    })
  }

  render(){
    console.log('render app')
    const chooseStylegreen = {color:'#0cc989'};
    const chooseStyleblue = {color:'#136df5'};
    
    const {currentPage} = this.state

    return (
      <div className="page" id="page">
        <Layout>
        <Router>
            <div className={currentPage === 'home' ? "header": 'headersticky'} id="header"> 
              {/*//导航栏div*/}
              <div className="brand">
                <div>
                  <img src={require('./img/logo.png').default} alt="大可logo" width="64" height="64"/>
                  <span className='brandblack'>可信群智化软件开发</span>
                </div>
              </div>
              <div className="nav">
                <Menu onClick={this.handleMenuClick} style={{fontSize: '25px'}} selectedKeys={[currentPage]} mode="horizontal">
                  <Menu.Item key='home'>
                    <Link to = '/'>首页</Link>
                  </Menu.Item>
                  <SubMenu key='shareground' title={<span >共享广场</span>}>
                    <Menu.Item key='publicdata' style={{marginBottom:'10px', fontWeight:'bold', fontSize:'20px'}}>
                      <Link className='menuItem' to="/publicdata">
                          公开代码与数据集
                      </Link>
                    </Menu.Item>
                    <Menu.Item key='privatedata' style={{marginBottom:'10px', fontWeight:'bold',fontSize:'20px'}}>
                      <Link  className='menuItem' to="/privatedata">
                        隐私代码与数据集
                      </Link>
                    </Menu.Item>
                  </SubMenu>
                  <Menu.Item key='personDetail'>
                    <Link to='/personDetail' >个人主页</Link>
                  </Menu.Item>
                </Menu>
              </div>
            </div>
          
            <Content className="content" id="content">
                  <Switch>
                    <Route path="/" exact component={ home }/>
                    <Route path='/publicdata' component = {publicDatapage}/>
                    <Route path='/privatedata' component = {privateDatapage}/>
                    <Route path='/personDetail' component = {personDetail}/>
                    <Route path='/detail' component = {detail}/>
                  </Switch>
            </Content>
          </Router>
        </Layout>
        
      </div>
    );
  }
  
}

export default App;
