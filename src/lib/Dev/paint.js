export function startDashboard(bus){
  bus.on('WORKER_MSG', ({id, msg}) => {
    console.log('x', id, msg)
  })
}