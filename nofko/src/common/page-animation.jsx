import {AnimatePresence, motion} from "framer-motion"

const AnimationWrapper = ({children, keyVal, className, initial= {opacity: 0}, animate = {opacity: 1}, transition = {duration: 1}}) => {

    return (
        <AnimatePresence>
            <motion.div
                key={keyVal}
                initial={initial}
                animate={animate}
                transition={transition}
                className={className}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    )
}

export default AnimationWrapper