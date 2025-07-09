#include "ThreadPool.h"

ThreadPool::ThreadPool(size_t num_threads) : stop(false) {
    for (size_t i = 0; i < num_threads; ++i) {
        workers.emplace_back(&ThreadPool::worker, this);
    }
}

// Destructor: Stop all threads
ThreadPool::~ThreadPool() {
    {
        unique_lock<mutex> lock(queue_mutex);
        stop = true;
    }
    condition.notify_all();

    for (thread &worker : workers) {
        if (worker.joinable())
            worker.join();
    }
}

// Enqueue a task
void ThreadPool::enqueue(function<void()> task) {
    {
        unique_lock<mutex> lock(queue_mutex);
        tasks.push(std::move(task));
    }
    condition.notify_one();
}

// Worker thread loop
void ThreadPool::worker() {
    while (true) {
        function<void()> task;
        {
            unique_lock<mutex> lock(queue_mutex);
            condition.wait(lock, [this] {
                return stop || !tasks.empty();
            });

            if (stop && tasks.empty()) {
                return;
            }

            task = std::move(tasks.front());
            tasks.pop();
        }
        try {
            task();
        } catch (const exception& e) {
            cerr << "Exception in worker thread: " << e.what() << endl;
        }
    }
}
