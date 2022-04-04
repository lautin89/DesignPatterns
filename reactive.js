/*
        * 变更式订阅 就是 动态的收集依赖，添加依赖关系，同时依赖在特定条件下 自动发生，例如：
        *   当读取一个依赖值时，则需要订阅依赖关系
        */

        // 设置全局作用域的中间变量，用来传递依赖关系
        let currentEffect;

        class Dep {

            #val;
            constructor(val) {
                // 以私有变量存储内部值
                this.#val = val;
                // 初始化事件池，以集合形式存储 可以直接去重
                this.effects = new Set();
            }

            // 依赖的值 在内部 需要劫持 实现自动更新
            get value() {
                // 添加订阅当前依赖，已写入currentEffect
                dep.depend();
                return this.#val;
            }

            // 修改依赖的值，触发更新 - 发布事件
            set value(newVal) {
                this.#val = newVal;
                // 执行依赖关系
                dep.notice();
            }

            // 添加依赖 - 订阅方法
            depend() {

                if (currentEffect) {
                    this.effects.add(currentEffect)
                }

            }

            // 通知执行 - 
            notice() {

                this.effects.forEach(fn => {

                    fn();
                })
            }

        }

        // 封装观测方法，动态的收集依赖关系，添加到事件池中
        // 在以前是在订阅时传入，现在是在函数中借助中间变量
        // 最终是在get时动态订阅依赖，watch就是引入依赖的
         function effectWatch(effect) {

            // 全局存储依赖关系
            currentEffect = effect;
            // 初始化执行一次，读取值时会自动订阅依赖
            effect();
            // // 无需手动添加订阅当前依赖，
            // dep.depend();
            // 清空依赖，避免干扰
            currentEffect = null;

        }

        const targetMap = new Map;

        function getDep(target, key) {
            /*
            * 添加依赖关系 - 存放在集合中{target -> depsMap -> dep}
            */
            let depsMap = targetMap.get(target);
            // 读取target的所有依赖信息
            if (!depsMap) {
                depsMap = new Map;
                targetMap.set(target, depsMap);
            }
            // 读取某个key的依赖信息
            let dep = depsMap.get(key);
            if (!dep) {
                dep = new Dep();
                depsMap.set(key, dep);
            }

            return dep;
        }

        // 响应式方法 使用通过proxy提取到每个值，然后利用get和set拦截，添加响应式依赖
        // 该方法要和watch一起使用，先使用watch引入依赖，接下来proxy内部捆绑dep，
         function reactive(target) {
            // 返回代理对象，添加对每个属性的拦截
            return new Proxy(target, {
                get(target, key) {
                    // debugger
                    const dep = getDep(target, key);
                    // 读取值时 订阅依赖关系
                    dep.depend();
                    return target[key];
                },
                set(target, key, newVal) {
                    // debugger
                    const dep = getDep(target, key);
                    target[key] = newVal;
                    // 更新值时 触发依赖执行，执行effetc，进入get 然后读取新的值 给关联变量
                    dep.notice();
                }
            })
        }

       
        
