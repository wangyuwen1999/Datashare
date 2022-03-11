import React from 'react';
import './personDetail.css'

import { Divider, Layout, Menu, message, Upload, Button, Modal, Form, Input, Select, Space, Switch as SwitchButton, InputNumber} from 'antd';

import {YuqueFilled, RocketFilled,InboxOutlined,AliwangwangFilled, MinusCircleOutlined,PlusOutlined } from '@ant-design/icons';
import { BrowserRouter as Router, Link, Redirect, Route, Switch } from 'react-router-dom';
import model from './personcomponents/model';
import data from './personcomponents/data';


const { Header, Footer, Sider, Content } = Layout;
const { Dragger } = Upload;
const {Option} = Select;

const API = {
    'getUserInfo':'/identity/information?address=',
    'getCategory':'/category/list',
    'upLoadData':'/data/upload',
    'uploadFile': '/file', // post
    'uploadMetric':'/assess/data', //post
}

let downloadaddress = window.config.downloadaddress;
const address = downloadaddress;

let url = window.config.url;
let fileurl = window.config.fileurl;

let tlist = [];
let tlistCount = 0;

let publicPageState = 1;
let privatePageState = 1;

function randomNum(minNum,maxNum){ 
    switch(arguments.length){ 
        case 1: 
            return parseInt(Math.random()*minNum+1,10); 
        break; 
        case 2: 
            return parseInt(Math.random()*(maxNum-minNum+1)+minNum,10); 
        break; 
            default: 
                return 0; 
            break; 
    } 
} 

class personDetail extends React.Component{
    formRef = React.createRef();
    constructor(params){
        super(params)
        let pathofffix = window.location.pathname;
        console.log(window.location.pathname)
        let tstate = "page1";
        switch(pathofffix){
            case '/personDetail/':
                tstate = "page1";
                break;
            case '/personDetail/page2':
                tstate = 'page2';
                break;
            default:
                break;
        }
        this.state = {
            userInfo:[],
            fileList:[],
            CategoryNumList: [],
            Category:[],
            current: tstate,
            visible: false,
            uploading: false,
        }
        this.imageid = randomNum(1,4)+'.png'
        console.log('this.prop personDetail')
        console.log(this.props)
    }

    componentDidMount(){
        console.log('componentDidMount personDetail')
        this.getUserInfo();
        this.getCategory();
    }

    getUserInfo = ()=>{
        let api = url + API['getUserInfo'] + address;
        this.myGet(api, (value)=>{
            this.setState({
                userInfo: value
            })
        })
    }

    myGet = (dataurl, Successcallback)=>{
        fetch(dataurl, {
            method: 'Get', // or 'PUT'
            mode: "cors",
            headers: new Headers({
                'Content-Type': 'application/json'
            })
        }).then(res => res.json())
        .catch(error => console.error('Error:', error))
        .then(response => {
            console.log('Success:', response);
            Successcallback(response);
        });
    }

    // myPost 向dataurl发送post请求，发送json格式数据values, 并使用Successcallback函数处理response
    myPost = (dataurl, values, Successcallback) => {
        fetch(dataurl, {
            method: 'POST', // or 'PUT'
            mode: "cors",
            body: JSON.stringify(values), // data can be `string` or {object}!
            headers: new Headers({
            'Content-Type': 'application/json'
            })
        }).then(res => res.json())
        .catch(error => console.error('Error:', error))
        .then(response => {
            console.log('Success:', response);
            Successcallback(response);
        });
    }

    getCategory = ()=>{
        let api = url + API['getCategory'];
        this.myGet(api, (values)=>{
            console.log('getCategory');
            console.log(values);
            this.setState({
                CategoryNumList: values['numlist'],
                Category: values['namelist'],
            })
        })
    }

    handleMenuClick = (e)=>{
        this.setState({ current: e.key });
    }

    handleCancel = ()=>{
        this.setState({
            visible: false
        });
    }

    handleChange = (value)=>{

    }

    handleUpload = ()=>{
        if (this.state.fileList.length === 0){
            message.warning('未选择文件，请选择文件')
            return;
        }
        console.log('personDetail fileList')
        console.log(this.state.fileList[0].name)
        this.setState({
            visible: true
        })
    }

    handleFileUpload = ()=>{
        const formData = new FormData();
        formData.append('file', this.state.fileList[0]);
        formData.append('type', 1);
        console.log(this.state.fileList[0]);
        this.setState({
            uploading: true,
        })
        fetch(fileurl+API['uploadFile'], {
            method:'POST',
            mode: "cors",
            body: formData,
        }).then(res => res.json())
        .catch(error => {
            console.error('Error:', error);
            this.setState({
                visible: false,
                uploading: false,
            });
            message.error("上传文件失败")
        })
        .then(response => {
            console.log('Success:', response);
            if (response['status'] == 'OK'){
                if (response['message'] != 'REPEATED'){
                    tlist[tlistCount++] = {
                        'md5':response['md5'],
                        'filename':this.state.fileList[0].name,
                        'type':1,
                        'time':(new Date().getTime()/1000 - 8*60*60),
                    };
                    this.handleFormUpload();
                }else{
                    message.warning('文件重复');
                    this.setState({
                        uploading: false
                    })
                }
            }else{
                message.error('上传文件失败');
                this.setState({
                    uploading: false
                })
            }
        });
    }

    handleFormUpload = ()=>{
        this.formRef.current.validateFields().then(values=>{
            console.log('origin form data');
            console.log(values);
            this.setState({
                uploading: true,
            });
            let myurl = url + API['upLoadData'];
            values.id = tlist[tlistCount-1]['md5']; 
            let metriclist = values.norms;
            delete values.norms;
            if (metriclist === undefined){
                metriclist = [];
            }
            console.log(values);
            fetch(myurl, {
                method: 'POST', // or 'PUT'
                mode: "cors",
                body: JSON.stringify(values), // data can be `string` or {object}!
                headers: new Headers({
                'Content-Type': 'application/json'
                })
            }).then(res => res.json())
            .catch(error => {
                console.error('Error:', error);
                this.setState({
                    visible: false,
                    uploading: false,
                });
                message.error("上传记录失败")
            })
            .then(response => {
                console.log('Successk:', response);
                if (response['state']){
                    let metricapi = url + API['uploadMetric'];
                    let metricvalue = {
                        serialNum:response['serialNum'],//数据集的序列号
                        list:metriclist,
                    }
                    this.myPost(metricapi, metricvalue, (secondvalues)=>{
                        message.success('上传成功');
                        this.setState({ 
                            uploading: false,
                            visible: false,
                            fileList: [],
                        });
                        this.formRef.current.resetFields();
                        if (values.isOpen){
                            console.log('values isOpen');
                            console.log(values.isOpen);
                            this.props.history.push({pathname: window.location.pathname, state: {reloadOpen: true, pageState: publicPageState}});
                            publicPageState = 1 - publicPageState;
                        }else{
                            console.log('values isOpen');
                            console.log(values.isOpen);
                            this.props.history.push({pathname: window.location.pathname, state: {reloadOpen: false, pageState: privatePageState}});
                            privatePageState = 1 - privatePageState;
                        }
                        
                    })
                }else{
                    message.warning('文件重复');
                    this.setState({
                        uploading: false
                    })
                }
            });
        });
    }

    render(){
        console.log(window.location.pathname);
        const {userInfo, current, fileList, uploading, visible, Category, CategoryNumList}  = this.state;
        console.log('render persondetail')
        const props = {
            onRemove: file => {
                this.setState(state => {
                    const index = state.fileList.indexOf(file);
                    const newFileList = state.fileList.slice();
                    newFileList.splice(index, 1);
                    return {
                        fileList: newFileList,
                    };
                });
            },
            beforeUpload: file => {
                if (fileList.length > 0){
                    message.warning('只能上传一个文件');
                    return false;
                }
                this.setState(state => ({
                    fileList: [file],
                }));
                return false;
            },
            fileList: fileList,
        };
        const layout = {
            labelCol: { span: 4 },
            wrapperCol: { span: 16 },
        };
        const validateMessages = {
            required: '${label} is required!',
        };
        return(
            <div className='personbody'>
                <Layout>
                    <div className='personDetail'>
                        <div className='backgroundimage'><img src={require('../../img/personground'+this.imageid).default}/></div>
                        <div className='detailshowsbox'>
                            <div className='detailbody'>
                                <div className='personavtar'>
                                    <img src={require('../../img/logo.png').default}/>
                                </div>
                                <div className='personIdentity'>
                                    <div className="userheader">
                                        <span className='username'>{userInfo.name}</span>
                                    </div>
                                    <div className='userbody'>
                                        <div className='userInfoItem'>
                                            <YuqueFilled style={{color:'#8590a6',marginRight:'12px'}}/>
                                            <span>IP</span>
                                            <div className="ProfileHeader-divider"></div>
                                            <span>{userInfo.ip}</span>
                                        </div>
                                        <div>
                                            <RocketFilled style={{color:'#8590a6',marginRight:'12px'}}/>
                                            <span>地址</span>
                                            <div className="ProfileHeader-divider"></div>
                                            <span>{address}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                        </div>
                    </div>
                    <div className='personMessage'>
                        <div className='userContent' style={{flex: '2 0 0'}}>
                        {/* basename='/personDetail' */}
                            {/* <Router > */}
                                <Menu onClick={this.handleMenuClick} selectedKeys={[current]} mode="horizontal" style={{fontSize:'25px', fontWeight:'bold', lineHeight:'80px'}}>
                                    <Menu.Item key="page1">
                                        <Link to='/personDetail/page1'>数据</Link>
                                    </Menu.Item>
                                    <Menu.Item key="page2">
                                        <Link to='/personDetail/page2'>模型</Link>
                                    </Menu.Item>
                                </Menu>
                                <Divider className='myDividerstyle'></Divider>
                                <div className='userContent-contentbody'>
                                    <Content>
                                        <Switch>
                                            <Redirect exact from="/personDetail/" to="/personDetail/page1"/>
                                            <Route path='/personDetail/page1' component = {data}/>
                                            <Route path='/personDetail/page2' component = {model}/>
                                        </Switch>
                                    </Content>
                                </div>
                            {/* </Router> */}
                        </div>
                        <div className='userSider' style={{flex: '1 0 0'}}>
                            <div className='userSidercontent'>
                                <div className='siderHeader'>
                                    <div className='siderHeaderLeft'>
                                        <img src={require('../../img/logo.png').default}/>
                                        <span>上传中心</span>
                                    </div>
                                    <div className='siderHeaderRight'>
                                        已上传 (0)
                                    </div>
                                </div>
                                <div className='uploadFilebody'>
                                    <Dragger {...props}>
                                        <p className="ant-upload-drag-icon">
                                        <InboxOutlined />
                                        </p>
                                        <p className="ant-upload-text">点击此处以选择文件或拖拽文件至此处完成文件上传</p>
                                    </Dragger>
                                    <Button key="submit" type="primary" onClick={this.handleUpload} style={{margin:'10px auto'}} ghost block>
                                        提交
                                    </Button>
                                </div>
                            </div>
                            <div className='userSiderPoints'>
                                <span>积分</span>
                                <span>{userInfo.points}  <AliwangwangFilled className='pointsicon'/></span>
                            </div>
                        </div>
                    </div>
                </Layout>
                <Modal
                    visible={visible}
                    title={<span>上传数据集 {visible ?fileList[0].name:''}</span>}
                    onCancel={this.handleCancel}
                    footer={[
                        <Button key="back" onClick={this.handleCancel}>
                        返回
                        </Button>,
                        <Button key="submit" type="primary" loading={uploading} onClick={this.handleFileUpload}>
                        提交
                        </Button>,
                    ]}
                    >
                        <Form {...layout} name="nest-messages" ref={this.formRef}  validateMessages={validateMessages}>
                            <Form.Item key='filename' name='name' label="名字" rules={[{ required: true }]}>
                                <Input />
                            </Form.Item>
                            <Form.Item key='filecategory' name='category' label="类别" rules={[{ required: true }]}>
                                <Select style={{ width: 120 }} onChange={this.handleChange}>
                                    {
                                        Category.map((_, index)=>{return <Option value={CategoryNumList[index]}>{Category[index]}</Option>})
                                    }
                                </Select>
                            </Form.Item>
                            <Form.Item key='point' name='point' label="积分" rules={[{ required: true }]}>
                                <InputNumber />
                            </Form.Item>
                            <Form.Item key='filedescription' name='description' label="描述">
                                <Input.TextArea style={{minHeight:'200px'}}/>
                            </Form.Item>
                            <Form.Item key='fileisOpen' name='isOpen' label='公开' valuePropName="checked">
                                <SwitchButton />
                            </Form.Item>
                            <Form.List name="norms" key='filenorms'>
                                {(fields, { add, remove }) => (
                                <>
                                    {fields.map((field, index) => (
                                        <Form.Item key={index} wrapperCol={{...layout.wrapperCol, offset:4}}>
                                            <Space  align="baseline">
                                                <Form.Item
                                                    {...field}
                                                    name={[field.name, 'name']}
                                                    fieldKey={[field.fieldKey, 'model']}
                                                    rules={[{ required: true, message: 'Missing Model' }]}
                                                    style={{marginBottom: 0}}
                                                    >
                                                    <Input placeholder='Model'/>
                                                </Form.Item>
                                                <Form.Item
                                                    {...field}
                                                    name={[field.name, 'metric']}
                                                    fieldKey={[field.fieldKey, 'metric']}
                                                    rules={[{ required: true, message: 'Missing metric' }]}
                                                    style={{marginBottom: 0}}
                                                    >
                                                    <Input placeholder='Metric'/>
                                                </Form.Item>

                                                <Form.Item
                                                    {...field}
                                                    name={[field.name, 'value']}
                                                    fieldKey={[field.fieldKey, 'value']}
                                                    rules={[{ required: true, message: 'Missing value' }]}
                                                    style={{marginBottom: 0}}
                                                    >
                                                    <Input placeholder='value'/>
                                                </Form.Item>
                                
                                                <MinusCircleOutlined onClick={() => remove(field.name)} />
                                        </Space>
                                      </Form.Item>
                                    )
                                    )}
                                    <Form.Item key='fileMetric' wrapperCol={{ ...layout.wrapperCol, offset: 4 }}>
                                        <Button   onClick={() => add()} block icon={<PlusOutlined />}>
                                            提交指标
                                        </Button>
                                    </Form.Item>
                                </>
                                )}
                            </Form.List>
                        </Form>
                </Modal> 
            </div>
        );
    }
}

export default personDetail;