#!/bin/bash

# ===== PERFORMANCE MONITORING SCRIPT =====
# Docker container performance monitoring ve resource tracking

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
LOG_FILE="performance-$(date +%Y%m%d_%H%M%S).log"
CONTAINERS=("admin-backend" "admin-ui" "web" "redis" "elasticsearch")
ALERT_THRESHOLD_CPU=80
ALERT_THRESHOLD_MEMORY=85

# Log function
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

# Alert function
alert() {
    echo -e "${RED}🚨 ALERT: $1${NC}" | tee -a "$LOG_FILE"
}

# Warning function
warning() {
    echo -e "${YELLOW}⚠️  WARNING: $1${NC}" | tee -a "$LOG_FILE"
}

# Success function
success() {
    echo -e "${GREEN}✅ $1${NC}" | tee -a "$LOG_FILE"
}

# Info function
info() {
    echo -e "${BLUE}ℹ️  $1${NC}" | tee -a "$LOG_FILE"
}

# Check if Docker is running
check_docker() {
    if ! docker info >/dev/null 2>&1; then
        alert "Docker is not running or not accessible"
        exit 1
    fi
    success "Docker is running"
}

# Get container stats
get_container_stats() {
    local container=$1
    local stats=$(docker stats --no-stream --format "table {{.CPUPerc}}\t{{.MemPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}" "$container" 2>/dev/null | tail -n 1)
    
    if [ -z "$stats" ]; then
        warning "Container $container is not running"
        return 1
    fi
    
    echo "$stats"
}

# Parse CPU percentage
parse_cpu() {
    local cpu_str=$1
    echo "$cpu_str" | sed 's/%//'
}

# Parse memory percentage
parse_memory() {
    local mem_str=$1
    echo "$mem_str" | sed 's/%//'
}

# Check resource thresholds
check_thresholds() {
    local container=$1
    local cpu=$2
    local memory=$3
    
    if (( $(echo "$cpu > $ALERT_THRESHOLD_CPU" | bc -l) )); then
        alert "Container $container CPU usage: ${cpu}% (threshold: ${ALERT_THRESHOLD_CPU}%)"
    elif (( $(echo "$cpu > 70" | bc -l) )); then
        warning "Container $container CPU usage: ${cpu}% (approaching threshold)"
    fi
    
    if (( $(echo "$memory > $ALERT_THRESHOLD_MEMORY" | bc -l) )); then
        alert "Container $container Memory usage: ${memory}% (threshold: ${ALERT_THRESHOLD_MEMORY}%)"
    elif (( $(echo "$memory > 75" | bc -l) )); then
        warning "Container $container Memory usage: ${memory}% (approaching threshold)"
    fi
}

# Get system resources
get_system_resources() {
    info "=== SYSTEM RESOURCES ==="
    
    # CPU usage
    local cpu_usage=$(top -l 1 | grep "CPU usage" | awk '{print $3}' | sed 's/%//')
    log "System CPU Usage: ${cpu_usage}%"
    
    # Memory usage
    local mem_info=$(vm_stat | grep "Pages free" | awk '{print $3}' | sed 's/\.//')
    local mem_total=$(vm_stat | grep "Pages total" | awk '{print $3}' | sed 's/\.//')
    local mem_used=$((mem_total - mem_info))
    local mem_percent=$((mem_used * 100 / mem_total))
    log "System Memory Usage: ${mem_percent}%"
    
    # Disk usage
    local disk_usage=$(df -h / | tail -1 | awk '{print $5}' | sed 's/%//')
    log "System Disk Usage: ${disk_usage}%"
    
    # Network interfaces
    info "Network Interfaces:"
    ifconfig | grep -E "^[a-z]" | awk '{print $1}' | while read -r interface; do
        if [ -n "$interface" ]; then
            local rx_bytes=$(ifconfig "$interface" | grep "RX bytes" | awk '{print $2}' | sed 's/bytes://')
            local tx_bytes=$(ifconfig "$interface" | grep "TX bytes" | awk '{print $6}' | sed 's/bytes://')
            log "  $interface - RX: $rx_bytes, TX: $tx_bytes"
        fi
    done
}

# Get Docker daemon info
get_docker_info() {
    info "=== DOCKER DAEMON INFO ==="
    
    local docker_version=$(docker version --format '{{.Server.Version}}')
    log "Docker Version: $docker_version"
    
    local docker_root=$(docker info --format '{{.DockerRootDir}}')
    log "Docker Root: $docker_root"
    
    local containers_running=$(docker ps --format '{{.Names}}' | wc -l)
    local containers_total=$(docker ps -a --format '{{.Names}}' | wc -l)
    log "Containers Running: $containers_running/$containers_total"
    
    local images_count=$(docker images --format '{{.Repository}}' | wc -l)
    log "Images: $images_count"
    
    local volumes_count=$(docker volume ls --format '{{.Name}}' | wc -l)
    log "Volumes: $volumes_count"
}

# Monitor containers
monitor_containers() {
    info "=== CONTAINER MONITORING ==="
    
    for container in "${CONTAINERS[@]}"; do
        info "Container: $container"
        
        local stats=$(get_container_stats "$container")
        if [ $? -eq 0 ]; then
            local cpu=$(parse_cpu "$(echo "$stats" | awk '{print $1}')")
            local memory=$(parse_memory "$(echo "$stats" | awk '{print $2}')")
            local mem_usage=$(echo "$stats" | awk '{print $3}')
            local net_io=$(echo "$stats" | awk '{print $4}')
            local block_io=$(echo "$stats" | awk '{print $5}')
            
            log "  CPU: ${cpu}%"
            log "  Memory: ${memory}% ($mem_usage)"
            log "  Network I/O: $net_io"
            log "  Block I/O: $block_io"
            
            check_thresholds "$container" "$cpu" "$memory"
        fi
        
        # Check container health
        local health=$(docker inspect --format='{{.State.Health.Status}}' "$container" 2>/dev/null || echo "no-health-check")
        log "  Health: $health"
        
        echo
    done
}

# Get container logs summary
get_logs_summary() {
    info "=== RECENT LOGS SUMMARY ==="
    
    for container in "${CONTAINERS[@]}"; do
        if docker ps --format '{{.Names}}' | grep -q "^$container$"; then
            info "Container: $container"
            
            # Get last 5 log lines
            local logs=$(docker logs --tail 5 "$container" 2>/dev/null | head -5)
            if [ -n "$logs" ]; then
                echo "$logs" | while IFS= read -r line; do
                    if [[ "$line" == *"ERROR"* ]] || [[ "$line" == *"error"* ]]; then
                        echo -e "${RED}  ERROR: $line${NC}" | tee -a "$LOG_FILE"
                    elif [[ "$line" == *"WARN"* ]] || [[ "$line" == *"warn"* ]]; then
                        echo -e "${YELLOW}  WARN: $line${NC}" | tee -a "$LOG_FILE"
                    else
                        log "  $line"
                    fi
                done
            else
                log "  No recent logs"
            fi
            echo
        fi
    done
}

# Performance recommendations
get_recommendations() {
    info "=== PERFORMANCE RECOMMENDATIONS ==="
    
    # Check for stopped containers
    local stopped_containers=$(docker ps -a --filter "status=exited" --format "{{.Names}}")
    if [ -n "$stopped_containers" ]; then
        warning "Stopped containers found: $stopped_containers"
        log "Recommendation: Clean up stopped containers with 'docker container prune'"
    fi
    
    # Check for unused images
    local unused_images=$(docker images -f "dangling=true" --format "{{.ID}}")
    if [ -n "$unused_images" ]; then
        warning "Unused images found: $(echo "$unused_images" | wc -l)"
        log "Recommendation: Clean up unused images with 'docker image prune'"
    fi
    
    # Check for unused volumes
    local unused_volumes=$(docker volume ls -f "dangling=true" --format "{{.Name}}")
    if [ -n "$unused_volumes" ]; then
        warning "Unused volumes found: $(echo "$unused_volumes" | wc -l)"
        log "Recommendation: Clean up unused volumes with 'docker volume prune'"
    fi
    
    # Check for network issues
    local network_errors=$(docker network ls --filter "driver=bridge" --format "{{.Name}}" | xargs -I {} docker network inspect {} --format '{{.Name}}: {{.IPAM.Config}}' 2>/dev/null | grep -v "[]" | wc -l)
    if [ "$network_errors" -gt 0 ]; then
        warning "Potential network configuration issues detected"
        log "Recommendation: Review network configuration and IP address conflicts"
    fi
}

# Main monitoring function
main() {
    log "Starting Performance Monitoring..."
    log "Log file: $LOG_FILE"
    echo
    
    check_docker
    echo
    
    get_system_resources
    echo
    
    get_docker_info
    echo
    
    monitor_containers
    
    get_logs_summary
    
    get_recommendations
    
    log "Performance monitoring completed"
    log "Log saved to: $LOG_FILE"
}

# Continuous monitoring mode
continuous_monitor() {
    info "Starting continuous monitoring (press Ctrl+C to stop)..."
    
    while true; do
        clear
        echo "=== CONTINUOUS MONITORING - $(date) ==="
        echo
        
        monitor_containers
        sleep 30
    done
}

# Help function
show_help() {
    echo "Performance Monitoring Script"
    echo "Usage: $0 [OPTIONS]"
    echo
    echo "Options:"
    echo "  -c, --continuous    Continuous monitoring mode"
    echo "  -h, --help          Show this help message"
    echo
    echo "Examples:"
    echo "  $0                  Single monitoring run"
    echo "  $0 -c              Continuous monitoring"
}

# Parse command line arguments
case "${1:-}" in
    -c|--continuous)
        continuous_monitor
        ;;
    -h|--help)
        show_help
        ;;
    "")
        main
        ;;
    *)
        echo "Unknown option: $1"
        show_help
        exit 1
        ;;
esac
