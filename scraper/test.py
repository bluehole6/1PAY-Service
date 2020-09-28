# 간단 스크래핑
# -*- coding: utf-8 -*-
import sys
import re
from selenium import webdriver
from selenium.webdriver.support.ui import Select
driver = webdriver.Chrome('./chromedriver')
driver.get('https://sks.recruiter.co.kr/app/jobnotice/view?systemKindCode=MRS2&jobnoticeSn=27726')

content = driver.find_element_by_xpath('//*[@id="content"]/table/tbody/tr[1]/td/span') # copy xpath

print(content.text)
