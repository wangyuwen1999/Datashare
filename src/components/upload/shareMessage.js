import React from 'react';
import './shareMessage.css'

import { Layout, Menu, Breadcrumb, List, Card, Popover, Divider, Drawer, Form, Input, Radio, Switch, Tag, Modal,Select, Space, Row, Col } from 'antd';
import { Upload, message, Button} from 'antd';
import { InboxOutlined } from '@ant-design/icons';

import {    
    ShareAltOutlined,
    UploadOutlined,
    SyncOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    CloudUploadOutlined,
    DeleteOutlined,
    MinusCircleOutlined,
    PlusOutlined,
} from '@ant-design/icons';

const API = {
    'uploadFile': '/uploadFile', // post
    'getDataList':'/getDataList', 
    'upLoadData':'/upLoadData',
    'delete':'/delete',
    'getCategory':'/Category/validList',
    'uploadMetric':'/Category/upLoad',
}

let url = window.config.url;
let fileurl = window.config.fileurl;
let downloadaddress = window.config.downloadaddress;
let dowloadip = window.config.downloadip;

const Category = ['计算机系统', '推荐系统'];

const { Dragger } = Upload;
const { Header, Content, Footer, Sider } = Layout;
const {Option} = Select;

let CurrentItemid = 0;

class shareMessage extends React.Component{
    formRef = React.createRef();
    constructor(props){
        super(props);
        this.state = {
            list: [],
            fileList: [],
            initailloading: true,
            uploading:false,
            visible: false,

            Category: [],
            CategoryNumList: []
        };
    }

    componentDidMount(){
        this.getDatalist();
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

    getDatalist  = () => {
        let api = fileurl + API['getDataList'];
        fetch(api, {
            method: "GET",
            mode: "cors",
        }).then(response => response.json()).then((value) => {
            console.log(value);
            if (value['state'] == false){
                message.warning('文件分布式系统未开启');
                return;
            }
            this.setState({
                list: value['data'].reverse(),
                initailloading: false,
            });
        });
    }

    handleUpload = ()=>{
        const formData = new FormData();
        formData.append('file', this.state.fileList[0]);
        console.log(this.state.fileList[0]);
        this.setState({
            uploading: true,
        })
        fetch(fileurl+API['uploadFile'], {
            method:'POST',
            mode: "cors",
            body: formData,
        }).then(res => res.json())
        .then(response => {
            console.log('Success:', response);
            if (response['status'] == 'OK'){
                let tlist = this.state.list;
                if (response['message'] != 'REPEATED'){
                    tlist.unshift({
                        'md5':response['md5'],
                        'filename':this.state.fileList[0].name,
                        'type':1,
                        'time':(new Date().getTime()/1000 - 8*60*60),
                    });
                    message.success('upload success');
                }else{
                    message.warning('file repeated');
                }
                this.setState({
                    list: tlist,
                    uploading: false,
                    fileList: [],
                });
            }else{
                this.setState({
                    uploading: false,
                    fileList: [],
                });
                message.error('upload failed');
            }
        });
    }

    handleCancel = ()=>{
        this.setState({
            visible: false
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
            values.id = this.state.list[CurrentItemid]['md5']; 
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
            .catch(error => console.error('Error:', error))
            .then(response => {
                console.log('Successk:', response);
                if (response['state']){
                    let metricapi = url + API['uploadMetric'];
                    let metricvalue = {
                        id:this.state.list[CurrentItemid]['md5'],//数据集的md5值，也就是id值
                        serialNum:response['serialNum'],//数据集的序列号
                        category:values.category,//数据集
                        list:metriclist,
                    }
                    this.myPost(metricapi, metricvalue, (secondvalues)=>{
                        this.setState({
                            uploading: false,
                        });
                        message.success('upload success');
                        this.setState({ visible: false });
                        this.formRef.current.resetFields();
                    })
                }
            });
        });
    }

    handleChange = (value)=>{

    }

    showModal = (index)=>{
        CurrentItemid = index;
        this.setState({
            visible: true
        })
    }

    deleteFile = (index)=>{
        message.loading('正在删除');
        let values = {
            md5: this.state.list[index]['md5'],
        } 
        let deleteurl = fileurl + API['delete'];
        fetch(deleteurl, {
            method: 'DELETE', 
            mode: "cors",
            body: JSON.stringify(values), // data can be `string` or {object}! 
            headers: new Headers({
              'Content-Type': 'application/json'
            })
        }).then(res => res.json())
        .catch(error => console.error('Error:', error))
        .then(response => {
            console.log('Success:', response);
            if (response['status']=='ok'){
                let newlist = this.state.list;
                newlist.splice(index, 1);
                this.setState({list:newlist});
                message.destroy()
                message.success('删除成功');
            }else{
                message.destroy()
                message.error('删除文件失败');
            }
        });
    }

    render(){
        const {fileList, CategoryNumList, Category } = this.state;
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
                        <div className='header_content'> 上传与共享数据 </div>
                        <div className='header_content_empty'></div>
                    </div>
                </section>
                <section className='contentsection'>
                    <div className='list_content'>
                        <label className='label_title'>
                            文件上传
                        </label>
                        <div className='uploadfile_body'>
                            <div>
                                <Dragger {...props}>
                                    <p className="ant-upload-drag-icon">
                                    <InboxOutlined />
                                    </p>
                                    <p className="ant-upload-text">点击此处以选择文件或拖拽文件至此处完成文件上传</p>
                                </Dragger>
                            </div>
                            <div style={{textAlign:'center'}}>
                                <Button key="submit" type="primary" loading={this.state.uploading} onClick={this.handleUpload} style={{margin:'10px 0'}}>
                                    提交
                                </Button>
                            </div>
                        </div>
                        <label className='label_title'>
                            已上传文件列表
                        </label>
                        <div className='filelist_body'>
                            <List
                                grid={{
                                    gutter: 16,
                                    xs: 1,
                                    sm: 2,
                                    md: 4,
                                    lg: 4,
                                    xl: 6,
                                    xxl: 3,
                                }}
                                loading={this.state.initailloading}
                                dataSource={this.state.list}
                                renderItem={(item, index) => (
                                <List.Item>
                                    <Card
                                        hoverable 
                                        title={item['filename']}
                                        extra={
                                            <div >
                                                <Popover content='分享到广场' title = '分享'>
                                                    <Button type="primary" shape="circle" icon={<ShareAltOutlined />} onClick={this.showModal.bind(this, index)} style={{marginRight:'5px'}}/>
                                                </Popover>
                                                <Popover content='删除此文件' title = '删除'>
                                                    <Button danger type="primary" shape="circle" icon={<DeleteOutlined />} onClick={this.deleteFile.bind(this, index)} />
                                                </Popover>
                                            </div>
                                        }
                                    >{new Date(item['time']* 1000).toLocaleString()}</Card>
                                </List.Item>
                                )}
                            />
                        </div>
                    </div>
                </section>

                <Modal
                    visible={this.state.visible}
                    title={<span>发布数据集 {this.state.list[CurrentItemid] === undefined ? '' : this.state.list[CurrentItemid]['filename']}</span>}
                    onCancel={this.handleCancel}
                    footer={[
                        <Button key="back" onClick={this.handleCancel}>
                        返回
                        </Button>,
                        <Button key="submit" type="primary" loading={this.state.uploading} onClick={this.handleFormUpload}>
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
                            <Form.Item name='isOpen' label='公开' valuePropName="checked">
                                <Switch />
                            </Form.Item>
                            <Form.List name="norms" >
                                {(fields, { add, remove }) => (
                                <>
                                    {fields.map(field => (
                                        <Form.Item wrapperCol={{...layout.wrapperCol, offset:4}}>
                                            <Space key={field.key}  align="baseline">
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
                                    <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 4 }}>
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

export default shareMessage;