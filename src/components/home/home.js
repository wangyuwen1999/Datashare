import React from 'react';
import './home.css';
import { Carousel, Button} from 'antd';
import { DoubleRightOutlined, DoubleLeftOutlined } from '@ant-design/icons';

const contentStyle = {
  height: '100vh',
  color: '#fff',
  lineHeight: '160px',
  textAlign: 'center',
  background: '#364d79',
};


class home extends React.Component{
    
    constructor(props){
        super(props);
        this.next = this.next.bind(this);
        this.prev = this.prev.bind(this);
    }

    next(){
        this.slider.next();
    }

    prev(){
        this.slider.prev();
    }

    render(){
        return (
            <div>
                <Carousel autoplay dots ref={el => (this.slider = el)}>
                    <div>
                        <img src={require('../../img/background1.png').default} style={contentStyle} alt = 'bad' />
                        <div id = "right_node">
                            <Button shape = 'circle' 
                                    icon = {<DoubleRightOutlined style = {{fontSize: '2rem'}} />} 
                                    onClick = {this.next}>
                            </Button>
                        </div>
                        <div className='leftwords'>
                            <div>
                                <h1>群智化软件开发</h1>
                                <p>一个安全，高效的源代码和数据集共享平台</p>
                            </div>
                        </div>
                    </div>
                    <div>
                        <img src={require('../../img/background2.png').default} style={contentStyle}alt = 'bad'/>
                        <div id = "left_node">
                            <Button shape = 'circle' 
                                    icon = {<DoubleLeftOutlined style = {{fontSize: '2rem'}}/>} 
                                    onClick = {this.prev} >
                            </Button>
                        </div>
                        <div className='leftwords'>
                            <div>
                                <h1>Technology share</h1>
                                <p>More secure, Higher efficiency</p>
                            </div>
                        </div>
                    </div>
                </Carousel>
            </div>
        );
        
    };
}

export default home;
