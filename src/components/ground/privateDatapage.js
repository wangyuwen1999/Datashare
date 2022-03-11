import React from 'react';
import './privateDatapage.css'

import { 
    List, Popover, Drawer, Divider, Row, 
    Col, Spin, Comment, message, Tag, Card, Button,
    Modal, Form, Input, Upload,Select, Space,
} from 'antd';

import {
    UploadOutlined,
    MoreOutlined,
    DeleteFilled,
    CheckCircleTwoTone,
    InboxOutlined,
} from '@ant-design/icons';


const { Meta } = Card;
const {Dragger} = Upload;
const {Option} = Select;

const API = {
    'getPrivateData': '/data/privatelist',
    'getDataInf':'/data/information', // getDataInf?serialNum={target}
    'getCategory':'/category/list',
    'deleteDatabySerialNum':'/data/file',
    'uploadModel':'/model/upLoad',
    'uploadFile':'/file',
    'deleteFile':'/delete'
}

let url = window.config.url;
let fileurl = window.config.fileurl;
let downloadaddress = window.config.downloadaddress;
let dowloadip = window.config.downloadip;

let CurrentItemid = 0;
let Datanum = 0;
let ListUnuse = 0;


class privateDatapage extends React.Component{
    formRef = React.createRef();
    constructor(props){
        super(props);
        this.state={
            // private data 页参数
            indexlist: [],
            list: [],
            initialloading: true,
            nodata: true,

            // 是否正在上传；
            uploading: false,

            // Modal是否可见；
            visible: false,

            // 记录发布新计算任务所使用的所有数据集的serialNum；
            uploadList: [],
            // 记录发布新计算任务所使用的所有数据集的index
            uploadindexList: [],

            // 记录一个数据集是否被选择用于发布新计算任务；
            itemHasupload: [],

            // 保存模型文件；
            fileList: [],

            // 类别；
            Category: [],
            CategoryNumList: [],
        }
    }
    componentDidMount(){
        console.log('componentDidMount');
        Datanum = 0;
        ListUnuse = 0;
        console.log(Datanum);
        this.getListindex();
        this.getCategory();
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

    getListindex = () => {
        let api = url + API["getPrivateData"];
        console.log('getPrivateData');
        this.myGet(api, this.privateDatasetcallback);
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

    getCategoryBynum(num){
        if (typeof(num) != Number){
            return num;
        }
        let rindex = 0;
        const {Category, CategoryNumList} = this.state;
        for (let i = 0; i < CategoryNumList.length; ++i){
            if (CategoryNumList[i] == num){
                rindex = i;
                break;
            }
        }
        return Category[rindex];
    }

    privateDatasetcallback = (value) => {
        let tindexlist = value['list'];
        console.log('public tindexlist');
        console.log(tindexlist);
        if (Datanum == tindexlist.length){
            this.setState({
                initialloading:false,
            });
            return;
        }
        Datanum = tindexlist.length;
        let nodataState = Datanum == 0;
        this.setState ({    
                            nodata: nodataState,
                            initialloading:false, 
                            indexlist: tindexlist,
                            list: new Array(Datanum).fill(null).map((_,index)=>{return {
                                loading: true, 
                                id:5,
                                ownerName: 'good',
                                name: 'hello',
                                description: 'hello, world',
                                ownerAddress: '124565',
                                category: 'gg',
                                categorynum: 0,
                                isopen: false,
                                serialNum: index+1,
                            }}),
                            itemHasupload: new Array(Datanum).fill(null).map((_, index)=>{return false}),
                        });
        this.getData(this.getDataCallback, 1, Datanum);
    };

    getData = (callback, begin, end) => {
        let tlist, tindexlist;
        tlist = this.state.list;
        tindexlist = this.state.indexlist
        for (let i = begin; i <= end; ++i){
            console.log('get ' + i);
            let finalapi = url+API["getDataInf"]+"?serialNum=" + tindexlist[i-1];
            console.log('really get ' + tindexlist[i-1]);
            fetch(finalapi, {
                method: "GET",
                mode: "cors",
            }).then(response => response.json()).then((value) => {
                callback(value);
            });
        }
    }

    getDataCallback = (res)=>{
        let newlist, index;
        newlist = this.state.list; 
        index = ListUnuse; 
        ListUnuse++;
        newlist[index] = {
            ownerName: res['ownerName'],
            name: res['name'],
            description: res['description'],
            ownerAddress: res['ownerAddress'],
            category: this.getCategoryBynum(res['category']),
            categorynum: res['category'],
            isopen: res['isOpen'],
            serialNum: parseInt(res['serialNum']),
            id: res['id'],
            loading: false,
        };
        this.setState({list: newlist});
    }

    deletedataItem = (index)=>{
        let deleteurl = url + API['deleteDatabySerialNum'] + '?serialNum=' + this.state.list[index].serialNum;
        fetch(deleteurl, {
            method: 'DELETE', 
            mode: "cors",
            headers: new Headers({
              'Content-Type': 'application/json'
            })
        }).then(res => res.json())
        .catch(error => console.error('Error:', error))
        .then(response => {
            console.log('Success:', response);
            if (response['state']){
                let md5 = this.state.list[index].id;
                let newlist = this.state.list;
                newlist.splice(index, 1);
                Datanum--;
                ListUnuse--;
                if (Datanum == 0){
                    this.setState({
                        list: newlist,
                        nodata: true,
                    })
                }else{
                    this.setState({
                        list: newlist,
                    });
                }
                let deleteurl = fileurl + API['deleteFile'];
                let value = {
                    md5: md5
                }
                console.log('delete file md5')
                console.log(value)
                fetch(deleteurl, {
                    method: 'DELETE', 
                    mode: "cors",
                    body: JSON.stringify(value),
                    headers: new Headers({
                    'Content-Type': 'application/json'
                    })
                }).then(res => res.json())
                .catch(error => console.error('Error:', error))
                .then(secondresponse => {
                    message.destroy();
                    message.success('删除成功'); 
                });
            }else{
                message.destroy()
                message.error('删除失败');
            }
        });
    }

    handleCancel = ()=>{
        this.setState({
            visible: false
        });
    }

    handleUpload = ()=>{
        this.formRef.current.validateFields().then(values=>{
            const formData = new FormData();
            formData.append('file', this.state.fileList[0]);
            formData.append('type', 2);
            this.setState({
                uploading: true,
            })
            fetch(fileurl+API['uploadFile'], {
                method:'POST',
                mode: "cors",
                body: formData,
            }).then(res => res.json())
            .then(response => {
                console.log('Successg:', response);
                if (response['status'] == 'OK'){
                    values['id'] = response['md5'];
                    let myurl = url + API['uploadModel'];
                    values.dataSets = this.state.uploadList;
                    delete values.file;
                    console.log(values);
                    fetch(myurl, {
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
                        this.setState({
                            uploading: false,
                            fileList: [],
                            visible: false,
                            uploadList:[],
                            itemHasupload: new Array(Datanum).fill(null).map((_, index)=>{return false}),
                        });
                        message.success('upload success');
                        this.formRef.current.resetFields();
                    });
                }else{
                    this.setState({
                        uploading: false,
                        fileList: [],
                        visible: false
                    });
                    message.error('upload failed');
                    this.formRef.current.resetFields();
                }
            });  
        });
    }

    showDetail =(index)=>{
        this.props.history.push({pathname: '/detail', state:{serialNum: this.state.list[index].serialNum, type:2}});
    }

    uploadNewModel = ()=>{
        this.setState({
            visible: true
        })
    }

    uploadPrivateDataset = (index)=>{
        let datalist = this.state.uploadList;
        let dataindexlist = this.state.uploadindexList;
        datalist = datalist.concat(this.state.list[index].serialNum);
        dataindexlist = dataindexlist.concat(index);
        console.log(datalist);
        let newitemlist = this.state.itemHasupload;
        newitemlist[index] = true;
        this.setState({
            uploadList: datalist,
            uploadindexList: dataindexlist,
            itemHasupload: newitemlist,
        })
    }

    cancaluploadPrivateDataset = (index) =>{
        let datalist = this.state.uploadList;
        let dataindexlist = this.state.uploadindexList;
        let serialNum = this.state.list[index].serialNum;
        let rindex = 0; // 序号在datalist中的位置；
        for (let i = 0; i < datalist.length; ++i){
            if (datalist[i] === serialNum){
                rindex = i;
                break;
            }
        }
        datalist.splice(rindex, 1);
        dataindexlist.splice(rindex, 1);
        console.log(datalist);
        let newitemlist = this.state.itemHasupload;
        newitemlist[index] = false;
        this.setState({
            uploadList: datalist,
            uploadindexList: dataindexlist,
            itemHasupload: newitemlist,
        });
    }

    cancelUploadDataset = (rindex) =>{
        let datalist = this.state.uploadList;
        let dataindexlist = this.state.uploadindexList;
        let index = dataindexlist[rindex];
        datalist.npm(rindex, 1);
        dataindexlist.splice(rindex,1);
        console.log(rindex);
        let newitemlist = this.state.itemHasupload;
        newitemlist[index] = false;
        this.setState({
            uploadList: datalist,
            uploadindexList: dataindexlist,
            itemHasupload: newitemlist,
        })
    }

    render(){
        const {initialloading, list, fileList, Category, CategoryNumList, nodata } = this.state;

        const MyCard = ({ listdata, index, downloadHandler, cancaldownloadHandler, moreHandler, deleteHandler}) => (
            <Spin spinning={listdata.loading}>
                <Card
                    key={index}
                    hoverable
                    style={{ width: 300 }}
                    cover={
                    <img
                        onClick={moreHandler.bind(this, index)}
                        alt="example"
                        src="https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png"
                    />
                    }
                    actions={[
                        <Popover content={<p>选择此数据集为作为新计算任务的数据集</p>} title='上传'>
                            {
                                this.state.itemHasupload[index] ? <CheckCircleTwoTone onClick={cancaldownloadHandler.bind(this, index)} style={{fontSize:'20px'}} /> : <UploadOutlined onClick={downloadHandler.bind(this, index)} style={{fontSize:'20px'}} key="download" />
                            }
                        </Popover>,
                        <Popover content={<p>查看更多详情</p>} title='更多'>
                            <MoreOutlined onClick={moreHandler.bind(this, index)} style={{fontSize:'20px'}} key="more" />
                        </Popover>,
                        <Popover content={<p>删除您在链上发布的信息</p>} title='删除'>
                            <DeleteFilled onClick={deleteHandler.bind(this, index)} style={{fontSize:'20px'}} key="delete"/>
                        </Popover>,
                    ]}
                >
                    <Meta
                    title={<div>
                            <span style={{ verticalAlign:'middle'}} className='Card-name'>{listdata.name}</span> 
                            <Tag style = {{marginLeft:'10px', verticalAlign:'middle'}} color="purple">Private</Tag> 
                            </div>}
                    description={listdata.ownerName}
                    />
                    <p style={{marginTop:'10px'}} className='cardDescription'>{listdata.description}</p>
                </Card>
            </Spin>
        );

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
                    fileList: [...state.fileList, file],
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
            <div className='body'>
                <section className='headersection'>
                    <div className='publicDatapageheader'>
                        <div className='header_content'> 隐私代码与数据集 </div>
                        <div className='header_content_empty'></div>
                    </div>
                </section>
                <section className='contentsection'>

                    {this.state.uploadList.length === 0 
                    ? 
                        <span></span>
                    : 
                        <div className='upload_choose_list'>
                            <label className='label_title'>
                                待使用的数据集
                            </label>
                            <List style={{marginLeft:'20px'}}
                                grid={{
                                    gutter: 16,
                                }}
                                dataSource={this.state.uploadindexList}
                                renderItem={(item,index)=> (
                                    <Tag closable color='blue' onClose={this.cancelUploadDataset.bind(this, index)}>
                                        {this.state.list[item].name}
                                    </Tag>
                                )}
                            />
                            <div style={{textAlign:'center'}}>
                                <Button type="primary" style={{ marginTop:'20px'}} loading={this.state.uploading} onClick={this.uploadNewModel}>提交</Button>
                            </div>
                            
                            <Divider />
                        </div>
                    }
                    
                    <div className='list_content'>
                        <label className='label_title'>
                            技术领域
                        </label>
                        <List
                            grid={{
                                gutter: 16,
                                xs: 1,
                                sm: 2,
                                md: 4,
                                lg: 4,
                                xl: 6,
                                xxl: 4,
                            }}
                            loading = {initialloading}
                            dataSource={list}
                            renderItem={(item,index)=> (
                                <List.Item>
                                    <MyCard listdata={item} index={index} cancaldownloadHandler = {this.cancaluploadPrivateDataset} downloadHandler={this.uploadPrivateDataset} moreHandler={this.showDetail} deleteHandler={this.deletedataItem}/>
                                </List.Item>
                            )}
                        />
                    </div>
                </section>
                <Modal
                    visible={this.state.visible}
                    title="上传计算任务"
                    onCancel={this.handleCancel}
                    footer={[
                        <Button key="back" onClick={this.handleCancel}>
                        返回
                        </Button>,
                        <Button key="submit" type="primary" loading={this.state.uploading} onClick={this.handleUpload}>
                        提交
                        </Button>,
                    ]}
                    >
                        <Form {...layout} name="nest-messages" ref={this.formRef}  validateMessages={validateMessages}>
                            <Form.Item name='name' label="名字" rules={[{ required: true }]}>
                                <Input />
                            </Form.Item>
                            <Form.Item name='category' label="类别" rules={[{ required: true }]}>
                                <Select style={{ width: 120 }} onChange={this.handleChange}>
                                    {
                                        Category.map((_, index)=>{return <Option value={CategoryNumList[index]}>{Category[index]}</Option>})
                                    }
                                </Select>
                            </Form.Item>
                            <Form.Item name='description' label="描述">
                                <Input.TextArea style={{minHeight:'200px'}}/>
                            </Form.Item>
                            <Form.Item name='file' label="模型" rules={[{ required: true }]}>
                                <Dragger {...props}>
                                    <p className="ant-upload-drag-icon">
                                    <InboxOutlined />
                                    </p>
                                    <p className="ant-upload-text">点击此处以选择文件或拖拽文件至此处完成文件上传</p>
                                </Dragger>
                            </Form.Item>
                        </Form>
                </Modal>
            </div>
        );
    }
}

export default privateDatapage;