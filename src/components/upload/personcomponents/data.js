import { Divider, Layout, Menu } from 'antd';
import React from 'react';
import { BrowserRouter as Router, Link, Route, Switch } from 'react-router-dom';
import './data.css'

import privatepage from './datacomponents/privatepage';
import publicpage from './datacomponents/publicpage';

const { Header, Footer, Sider, Content } = Layout;

class data extends React.Component{

    constructor(params){
        super(params);
        let pathofffix = window.location.pathname;
        console.log(window.location.pathname)
        let tstate = "publicdata";
        switch(pathofffix){
            case '/personDetail/page1':
            case '/personDetail/page1/':
                tstate = 'publicdata';
                break;
            case '/personDetail/page1/privatedata':
                tstate = 'privatedata';
                break;
            default:
                break;
        }
        this.state = {
            currentPage: tstate,
        }
        console.log('this.prop data')
        console.log(this.props)
    }

    handleClick = (e)=>{
        this.setState({
            currentPage: e.key
        })
    }

    render(){
        const {currentPage} = this.state;
        return(
            <div className='subpage'>
                {/* basename='/personDetail/page1' */}
                {/* <Router > */}
                    <div className='subMenuBox'>
                        <Menu onClick={this.handleClick} selectedKeys={[currentPage]} mode="horizontal" style={{fontWeight:'bold', fontSize:'18px', lineHeight:'48px'}}>
                            <Menu.Item key="publicdata">
                                <Link to='/personDetail/page1/'>我的共享数据</Link>
                            </Menu.Item>
                            <Menu.Item key="privatedata">
                                <Link to='/personDetail/page1/privatedata'>我的私有数据</Link>
                            </Menu.Item>
                        </Menu>
                    </div>
                    <div className='Dividerbox'>
                        <Divider className='myDividerstyle'></Divider>
                    </div>
                    <Content>
                        <Switch>
                            <Route path='/personDetail/page1/' exact component = {publicpage}/>
                            <Route path='/personDetail/page1/privatedata' component = {privatepage}/>
                        </Switch>
                    </Content>
                {/* </Router> */}
            </div>
        )
    }
}

export default data;