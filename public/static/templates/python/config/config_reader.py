import configparser
import argparse

def reader():
    config = configparser.ConfigParser()
    config.read('config/config.ini', encoding='utf-8')
    
    parser = argparse.ArgumentParser()
    parser.add_argument('--mode', '-m', type=str, default='Default')
    args = parser.parse_args()
    #print('args : ', type(args.mode))
    mode = args.mode
    
    
    
    return config[mode]

