"use client";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Target, 
  Coffee, 
  BarChart3, 
  Keyboard, 
  CheckSquare, 
  Smartphone,
  Zap,
  Clock,
  TrendingUp,
  Command,
  Layers,
  Bell
} from "lucide-react";

const features = [
  {
    icon: Target,
    title: "High-Precision Timer",
    description: "Web Worker-powered timer with minimal drift, even when tab is backgrounded.",
    gradient: "from-blue-500 to-cyan-500",
    delay: 0.1
  },
  {
    icon: Coffee,
    title: "Smart Breaks",
    description: "Automatic short and long breaks with configurable intervals.",
    gradient: "from-purple-500 to-pink-500",
    delay: 0.2
  },
  {
    icon: BarChart3,
    title: "Analytics & Insights",
    description: "Track your productivity with detailed charts and progress metrics.",
    gradient: "from-green-500 to-emerald-500",
    delay: 0.3
  },
  {
    icon: Keyboard,
    title: "Keyboard-First",
    description: "Full keyboard shortcuts and command palette for power users.",
    gradient: "from-orange-500 to-red-500",
    delay: 0.4
  },
  {
    icon: CheckSquare,
    title: "Task Management",
    description: "Organize tasks with projects, tags, and priority levels.",
    gradient: "from-indigo-500 to-purple-500",
    delay: 0.5
  },
  {
    icon: Smartphone,
    title: "PWA Ready",
    description: "Install as a native app with offline support and notifications.",
    gradient: "from-pink-500 to-rose-500",
    delay: 0.6
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

export const FeaturesSection = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-slate-900 to-slate-800 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent"
          >
            Everything you need to stay focused
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-xl text-gray-400 max-w-3xl mx-auto"
          >
            Built with modern web technologies for the best developer experience
          </motion.p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              custom={feature.delay}
              whileHover={{ 
                y: -10,
                transition: { duration: 0.3 }
              }}
            >
              <Card className="h-full bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300 group cursor-pointer">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${feature.gradient} group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-xl text-white group-hover:text-gray-200 transition-colors duration-300">
                      {feature.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-400 text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Additional Features Highlight */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          viewport={{ once: true }}
          className="mt-20 text-center"
        >
          <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-2xl p-8 border border-white/10 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 1 }}
              viewport={{ once: true }}
              className="flex justify-center mb-6"
            >
              <div className="p-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500">
                <Zap className="w-8 h-8 text-white" />
              </div>
            </motion.div>
            <h3 className="text-2xl font-bold text-white mb-4">
              And so much more...
            </h3>
            <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
              Keyboard shortcuts, custom themes, data export, team collaboration, and continuous updates.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-400">
              {[
                { icon: Command, text: "Command Palette" },
                { icon: TrendingUp, text: "Progress Tracking" },
                { icon: Bell, text: "Smart Notifications" },
                { icon: Layers, text: "Multiple Projects" },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 1.2 + index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-center space-x-2 bg-white/5 px-3 py-2 rounded-lg"
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.text}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};