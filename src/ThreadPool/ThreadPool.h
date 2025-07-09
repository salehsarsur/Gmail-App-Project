#include <iostream>
#include <thread>
#include <unistd.h>
#include <vector>
#include <queue>
#include <mutex>
#include <functional>
#include <condition_variable>
using namespace std;

class ThreadPool {
public:
    ThreadPool(size_t num_threads);  // Constructor: start worker threads
    ~ThreadPool();                   // Destructor: stop and join threads

    void enqueue(function<void()> task);            // Add a task to the queue

private:
    vector<thread> workers;
    queue<function<void()>> tasks;

    mutex queue_mutex;
    condition_variable condition;
    bool stop;

    void worker();
};
