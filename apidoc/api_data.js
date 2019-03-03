define({ "api": [
  {
    "type": "post",
    "url": "/admin/login",
    "title": "管理员登陆获取token",
    "name": "login",
    "group": "admin",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "username",
            "description": "<p>候选人的名字.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "pwd",
            "description": "<p>密码</p>"
          }
        ]
      }
    },
    "header": {
      "examples": [
        {
          "title": "Header-Example:",
          "content": "{\n  \"Authorization\": \"Basic dXNlcm5hbWU6cGFzc3dvcmQ=\"\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "    HTTP/1.1 200 OK\n{\n    \"success\": true,\n    \"data\": {\n        \"username\": \"username\",\n        \"email\": \"zheng@qq.com\",\n        \"_id\": \"5c4200140260f783d57bdb17\",\n        \"accessToken\": \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InVzZXJuYW1lIiwiaWF0IjoxNTQ3ODMwOTc1fQ.T9OSsEuzHTi_8OZMrYbZdOkWLGkRyLeUXSud-1tAD_c\"\n    }\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "examples": [
        {
          "title": "Error-Response:",
          "content": "  HTTP/1.1 404 Not Found\n{\n    \"success\": false,\n    \"code\": 4012,\n    \"msg\": \"Username or password does not exist\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/routes/users.js",
    "groupTitle": "admin"
  }
] });
