# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]:
    - generic [ref=e6]:
      - img "Logo" [ref=e7]
      - generic [ref=e8]: Todo App
    - generic [ref=e10]:
      - generic [ref=e11]:
        - heading "It's good to have you back!" [level=1] [ref=e12]
        - paragraph [ref=e13]: Welcome to our secure portal! To access the full functionality of our app, kindly provide your credentials below. Your privacy is our priority.
      - generic [ref=e14]:
        - generic [ref=e15]:
          - generic [ref=e16]:
            - generic [ref=e18]:
              - generic [ref=e19]: Email*
              - textbox "Email*" [ref=e21]
            - generic [ref=e23]:
              - generic [ref=e24]: Password*
              - generic [ref=e25]:
                - textbox "Password*" [ref=e26]
                - button "toggle password visibility" [ref=e27]:
                  - img
          - button "Login" [ref=e28] [cursor=pointer]
        - generic [ref=e29]:
          - text: Don't have an account?
          - link "Register" [ref=e30] [cursor=pointer]:
            - /url: /register
  - button "Open Next.js Dev Tools" [ref=e36] [cursor=pointer]:
    - img [ref=e37] [cursor=pointer]
  - alert [ref=e40]
```