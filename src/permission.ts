// 路由鉴权的权限，路由是否可以访问，守卫
import router from '@/router';
import setting from './setting';
import userStores from '@/store/modules/user';
import nprogress from 'nprogress';
import 'nprogress/nprogress.css';
import pinia from './store';

// 初始化
nprogress.configure({ showSpinner: false });
// 获取用户对象
let userStore = userStores(pinia);
// 全局的前置守卫
router.beforeEach(async (to: any, from: any, next: any) => {
    // to: 访问的路由对象
    // from: 从哪个路由对象跳转过来
    // next: 放行，放行后，会跳转到下一个路由
    document.title = setting.title + '-' + to.meta.title;
    // 进度条开始
    nprogress.start();
    // 获取token，判断是否登录
    let token = userStore.token;
    // 获取用户名字
    let username = userStore.username;
    if (token) {
        if (to.path === '/login') {
            // 如果已经登录，并且要跳转的页面是登录页，则跳转到首页
            next({ path: '/' });
        } else {
            // 如果已经登录，并且要跳转的页面不是登录页，则直接放行
            if (username) {
                next();
            } else {
                try {
                    await userStore.userPart();
                    next();
                } catch (error) {
                    // 如果获取用户信息失败，则跳转到登录页
                    await userStore.logout();
                    next({ path: '/login' });
                }
            }
        }
    } else {
        if (to.path == '/login') {
            next();
        } else {
            next({ path: '/login' });
        }
    }
});

// 全局的后置守卫
router.afterEach((to: any, from: any, next: any) => {
    nprogress.done();
})


